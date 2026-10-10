import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import pg from 'pg';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

/**
 * New-mail notifications for real-time inbox updates.
 *
 * Delivery inside one process goes through an EventEmitter. With several backend instances,
 * each one also publishes over Postgres NOTIFY and LISTENs for the others, so a message stored
 * by the instance that received the SMTP connection reaches SSE clients connected to any instance.
 */
export interface MailEvent {
  address: string;
  messageId: string;
}

const CHANNEL = 'tempmail_mail_received';
const INSTANCE_ID = randomUUID();
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

let client: pg.Client | null = null;
let stopped = false;
let retryTimer: NodeJS.Timeout | null = null;

export function subscribe(address: string, listener: (event: MailEvent) => void): () => void {
  emitter.on(address, listener);
  return () => emitter.off(address, listener);
}

export function publishMail(event: MailEvent) {
  emitter.emit(event.address, event);
  if (!client) return;
  const payload = JSON.stringify({ ...event, origin: INSTANCE_ID });
  client.query('SELECT pg_notify($1, $2)', [CHANNEL, payload]).catch((error: unknown) => {
    logger.warn({ err: error }, 'pg_notify failed; other instances will pick the message up on their next poll');
  });
}

async function connect(attempt = 0) {
  if (stopped) return;
  const next = new pg.Client({ connectionString: config.databaseUrl });
  next.on('error', (error) => {
    if (client !== next) return; // errors before LISTEN succeeded are handled below
    logger.warn({ err: error }, 'realtime LISTEN connection lost');
    scheduleReconnect(0);
  });
  next.on('notification', (msg) => {
    if (msg.channel !== CHANNEL || !msg.payload) return;
    try {
      const { address, messageId, origin } = JSON.parse(msg.payload) as MailEvent & { origin: string };
      if (origin !== INSTANCE_ID) emitter.emit(address, { address, messageId });
    } catch {
      // ignore malformed payloads
    }
  });

  try {
    await next.connect();
    await next.query(`LISTEN ${CHANNEL}`);
    client = next;
    logger.info('realtime: listening for cross-instance notifications');
  } catch (error) {
    logger.warn({ err: error, attempt }, 'realtime: could not LISTEN; retrying');
    await next.end().catch(() => {});
    scheduleReconnect(attempt + 1);
  }
}

function scheduleReconnect(attempt: number) {
  const old = client;
  client = null;
  old?.end().catch(() => {});
  if (stopped || retryTimer) return;
  const delay = Math.min(30_000, 1000 * 2 ** attempt);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void connect(attempt);
  }, delay);
  retryTimer.unref();
}

export function startEventBridge() {
  if (!config.realtime.pgNotify) return;
  stopped = false;
  void connect();
}

export async function stopEventBridge() {
  stopped = true;
  if (retryTimer) clearTimeout(retryTimer);
  const old = client;
  client = null;
  await old?.end().catch(() => {});
}
