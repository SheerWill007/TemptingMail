import { simpleParser, type ParsedMail } from 'mailparser';
import { config } from '../config.js';
import { toAddress } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import { publishMail } from './events.js';

const PREVIEW_LENGTH = 200;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002';
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

export function makePreview(parsed: Pick<ParsedMail, 'text' | 'html'>): string {
  const source =
    parsed.text ||
    (typeof parsed.html === 'string'
      ? parsed.html.replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
      : '');
  const collapsed = source.replace(/\s+/g, ' ').trim();
  return collapsed.length > PREVIEW_LENGTH ? `${collapsed.slice(0, PREVIEW_LENGTH).trimEnd()}…` : collapsed;
}

/** Persists a raw RFC 5322 message once per recipient mailbox (creating or extending mailboxes as needed). */
export async function storeIncomingMessage(raw: Buffer, recipients: string[]) {
  const parsed = await simpleParser(raw);
  const expiresAt = new Date(Date.now() + config.mailboxTtlMs);

  const data = {
    from: truncate(parsed.from?.text || 'unknown', 512),
    subject: parsed.subject ? truncate(parsed.subject, 998) : null,
    preview: makePreview(parsed),
    size: raw.length,
    hasAttachments: parsed.attachments.some((a) => !a.related),
    raw: new Uint8Array(raw),
    expiresAt,
  };

  const stored = await prisma.$transaction(async (tx) => {
    const created: { address: string; messageId: string }[] = [];
    for (const address of recipients) {
      // Every delivery keeps the mailbox alive for another TTL window.
      const mailbox = await tx.mailbox.upsert({
        where: { address },
        create: { address, expiresAt },
        update: { expiresAt },
      });
      const message = await tx.message.create({ data: { ...data, mailboxId: mailbox.id }, select: { id: true } });
      created.push({ address, messageId: message.id });
    }
    return created;
  });

  // Only after commit, so listeners can always read what they're told about.
  for (const event of stored) publishMail(event);

  return { ids: stored.map((s) => s.messageId), parsed };
}

/** Creates the mailbox, or revives it if it already exists. Idempotent. */
export async function ensureMailbox(localPart: string) {
  const address = toAddress(localPart);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.mailboxTtlMs);

  const existing = await prisma.mailbox.findUnique({ where: { address } });
  if (existing) {
    if (existing.expiresAt > now) return { mailbox: existing, created: false };
    const mailbox = await prisma.mailbox.update({ where: { id: existing.id }, data: { expiresAt } });
    return { mailbox, created: false };
  }

  try {
    const mailbox = await prisma.mailbox.create({ data: { address, expiresAt } });
    return { mailbox, created: true };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const mailbox = await prisma.mailbox.findUniqueOrThrow({ where: { address } });
    return { mailbox, created: false };
  }
}

export async function getInbox(localPart: string, limit = 100) {
  const address = toAddress(localPart);
  const now = new Date();
  const mailbox = await prisma.mailbox.findUnique({
    where: { address },
    include: {
      messages: {
        where: { expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          from: true,
          subject: true,
          preview: true,
          size: true,
          hasAttachments: true,
          isRead: true,
          createdAt: true,
        },
      },
    },
  });

  if (!mailbox || mailbox.expiresAt <= now) {
    return { address, exists: false, createdAt: null, expiresAt: null, messages: [] };
  }
  return {
    address,
    exists: true,
    createdAt: mailbox.createdAt,
    expiresAt: mailbox.expiresAt,
    messages: mailbox.messages,
  };
}

export async function findMessage(localPart: string, id: string) {
  return prisma.message.findFirst({
    where: { id, expiresAt: { gt: new Date() }, mailbox: { address: toAddress(localPart) } },
  });
}

export async function markRead(id: string) {
  await prisma.message.update({ where: { id }, data: { isRead: true } });
}

export async function deleteMessage(localPart: string, id: string): Promise<boolean> {
  const result = await prisma.message.deleteMany({ where: { id, mailbox: { address: toAddress(localPart) } } });
  return result.count > 0;
}

export async function deleteMailbox(localPart: string): Promise<boolean> {
  const result = await prisma.mailbox.deleteMany({ where: { address: toAddress(localPart) } });
  return result.count > 0;
}

/** Parses a stored message, leaving `cid:` links intact so inline images can be served as attachments. */
export function parseRaw(raw: Uint8Array) {
  return simpleParser(Buffer.from(raw), { skipImageLinks: true });
}
