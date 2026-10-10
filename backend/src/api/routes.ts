import { Router, type Request } from 'express';
import { config } from '../config.js';
import { isValidLocalPart, normalizeLocalPart, randomLocalPart, toAddress } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import {
  deleteMailbox,
  deleteMessage,
  ensureMailbox,
  findMessage,
  getInbox,
  markRead,
  parseRaw,
} from '../services/mailStore.js';
import { HttpError } from './errors.js';
import { createMailboxLimiter } from './rateLimit.js';

/** Image types that are safe to render inline (no SVG: it can carry script). */
const INLINE_SAFE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/bmp']);

function localPartParam(req: Request): string {
  const localPart = normalizeLocalPart(String(req.params.name ?? ''));
  if (!isValidLocalPart(localPart)) throw new HttpError(400, 'Invalid mailbox name');
  return localPart;
}

function messagePath(localPart: string, id: string) {
  return `/api/mailboxes/${localPart}/messages/${encodeURIComponent(id)}`;
}

export function createRouter() {
  const router = Router();

  router.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, database: 'up', uptime: Math.round(process.uptime()) });
    } catch {
      res.status(503).json({ ok: false, database: 'down' });
    }
  });

  router.get('/config', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      domain: config.mailDomain,
      ttlHours: config.mailboxTtlMs / 3_600_000,
      maxMessageBytes: config.smtp.maxMessageBytes,
    });
  });

  router.post('/mailboxes', createMailboxLimiter, async (req, res) => {
    const requested: unknown = req.body?.username;
    if (requested !== undefined && requested !== null && typeof requested !== 'string') {
      throw new HttpError(400, 'username must be a string');
    }

    const localPart = requested ? normalizeLocalPart(requested) : randomLocalPart();
    if (!isValidLocalPart(localPart)) {
      throw new HttpError(
        400,
        'Usernames may contain letters, numbers, dots, dashes and underscores (max 64), and must start and end with a letter or number.',
      );
    }

    const { mailbox, created } = await ensureMailbox(localPart);
    res.status(created ? 201 : 200).json({
      username: localPart,
      address: mailbox.address,
      createdAt: mailbox.createdAt,
      expiresAt: mailbox.expiresAt,
    });
  });

  router.get('/mailboxes/:name', async (req, res) => {
    const inbox = await getInbox(localPartParam(req));
    res.set('Cache-Control', 'no-store');
    res.json(inbox);
  });

  router.delete('/mailboxes/:name', async (req, res) => {
    await deleteMailbox(localPartParam(req));
    res.status(204).end();
  });

  router.get('/mailboxes/:name/messages/:id', async (req, res) => {
    const localPart = localPartParam(req);
    const message = await findMessage(localPart, String(req.params.id));
    if (!message) throw new HttpError(404, 'Message not found');

    const parsed = await parseRaw(message.raw);
    const base = messagePath(localPart, message.id);

    // Point cid: references (inline images) at our attachment endpoint.
    const cidIndex = new Map<string, number>();
    parsed.attachments.forEach((att, index) => {
      if (att.contentId) cidIndex.set(att.contentId.replace(/^<|>$/g, '').toLowerCase(), index);
    });
    let html = typeof parsed.html === 'string' ? parsed.html : null;
    if (html && cidIndex.size) {
      html = html.replace(/cid:([^"'\s)>]+)/gi, (match, cid: string) => {
        let key = cid;
        try {
          key = decodeURIComponent(cid);
        } catch {
          // keep the raw value
        }
        const index = cidIndex.get(key.toLowerCase());
        return index === undefined ? match : `${base}/attachments/${index}`;
      });
    }

    if (!message.isRead) await markRead(message.id);

    res.set('Cache-Control', 'no-store');
    res.json({
      id: message.id,
      to: toAddress(localPart),
      from: message.from,
      subject: message.subject,
      createdAt: message.createdAt,
      date: parsed.date ?? message.createdAt,
      size: message.size,
      html,
      text: parsed.text ?? null,
      attachments: parsed.attachments.map((att, index) => ({
        index,
        filename: att.filename || `attachment-${index + 1}`,
        contentType: att.contentType,
        size: att.size,
        inline: Boolean(att.related && att.contentId),
        url: `${base}/attachments/${index}`,
      })),
      rawUrl: `${base}/raw`,
    });
  });

  router.delete('/mailboxes/:name/messages/:id', async (req, res) => {
    const deleted = await deleteMessage(localPartParam(req), String(req.params.id));
    if (!deleted) throw new HttpError(404, 'Message not found');
    res.status(204).end();
  });

  router.get('/mailboxes/:name/messages/:id/raw', async (req, res) => {
    const message = await findMessage(localPartParam(req), String(req.params.id));
    if (!message) throw new HttpError(404, 'Message not found');
    res.set('Content-Type', 'message/rfc822');
    res.set('Content-Security-Policy', "default-src 'none'; sandbox");
    res.attachment(`${message.id}.eml`);
    res.send(Buffer.from(message.raw));
  });

  router.get('/mailboxes/:name/messages/:id/attachments/:index', async (req, res) => {
    const message = await findMessage(localPartParam(req), String(req.params.id));
    if (!message) throw new HttpError(404, 'Message not found');

    const index = Number(req.params.index);
    const parsed = await parseRaw(message.raw);
    const attachment = Number.isInteger(index) ? parsed.attachments[index] : undefined;
    if (!attachment) throw new HttpError(404, 'Attachment not found');

    const contentType = (attachment.contentType || 'application/octet-stream').toLowerCase();
    const filename = attachment.filename || `attachment-${index + 1}`;

    // Never let attachment content execute on our origin.
    res.set('Content-Security-Policy', "default-src 'none'; sandbox");
    res.set('Cache-Control', 'private, max-age=3600');
    res.type(contentType);
    if (INLINE_SAFE_TYPES.has(contentType) && req.query.download === undefined) {
      res.set('Content-Disposition', 'inline');
    } else {
      res.attachment(filename);
    }
    res.send(attachment.content);
  });

  return router;
}
