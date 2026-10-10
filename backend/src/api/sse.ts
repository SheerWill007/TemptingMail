import type { Request, Response } from 'express';
import { config } from '../config.js';
import { sseClients } from '../lib/metrics.js';
import { subscribe } from '../services/events.js';
import { HttpError } from './errors.js';

const HEARTBEAT_MS = 25_000;
const open = new Set<Response>();
const perIp = new Map<string, number>();

/**
 * Streams `message` events for one mailbox as Server-Sent Events. Clients refetch the inbox when
 * an event arrives; the payload deliberately carries only the new message id.
 */
export function streamMailbox(req: Request, res: Response, address: string) {
  const ip = req.ip ?? 'unknown';
  if (open.size >= config.realtime.maxClients) {
    throw new HttpError(503, 'Real-time updates are at capacity; falling back to polling.', 'REALTIME_UNAVAILABLE');
  }
  if ((perIp.get(ip) ?? 0) >= config.realtime.maxClientsPerIp) {
    throw new HttpError(429, 'Too many live connections from your network.', 'RATE_LIMITED');
  }

  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 5000\n\n');

  open.add(res);
  perIp.set(ip, (perIp.get(ip) ?? 0) + 1);
  sseClients.set(open.size);

  const unsubscribe = subscribe(address, (event) => {
    res.write(`event: message\ndata: ${JSON.stringify({ id: event.messageId })}\n\n`);
  });
  const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    unsubscribe();
    open.delete(res);
    const remaining = (perIp.get(ip) ?? 1) - 1;
    if (remaining > 0) perIp.set(ip, remaining);
    else perIp.delete(ip);
    sseClients.set(open.size);
  };
  req.on('close', cleanup);
  res.on('close', cleanup);
}

/** Ends every open stream so the HTTP server can shut down promptly. */
export function closeAllStreams() {
  for (const res of open) res.end();
}
