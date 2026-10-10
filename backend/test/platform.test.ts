import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/mailStore.js', () => ({
  ensureMailbox: vi.fn(),
  getInbox: vi.fn(),
  findMessage: vi.fn().mockResolvedValue(null),
  markRead: vi.fn(),
  deleteMessage: vi.fn(),
  deleteMailbox: vi.fn(),
  parseRaw: vi.fn(),
}));
vi.mock('../src/lib/prisma.js', () => ({
  prisma: { $queryRaw: vi.fn().mockRejectedValue(new Error('db down')) },
}));

const { createApp } = await import('../src/api/app.js');
const { isReservedLocalPart } = await import('../src/lib/email.js');
const { publishMail } = await import('../src/services/events.js');
const { ConnectionLimiter } = await import('../src/smtp/connectionLimiter.js');
const app = createApp();

describe('reserved names', () => {
  it.each(['admin', 'administrator', 'hostmaster', 'postmaster', 'webmaster', 'abuse', 'root'])('reserves %s', (name) =>
    expect(isReservedLocalPart(name)).toBe(true),
  );

  it('does not reserve ordinary names', () => {
    expect(isReservedLocalPart('alice')).toBe(false);
    expect(isReservedLocalPart('admin2')).toBe(false);
  });

  it('refuses to create reserved mailboxes', async () => {
    const res = await request(app).post('/api/mailboxes').send({ username: 'Admin' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RESERVED_USERNAME');
  });

  it('refuses to read reserved mailboxes', async () => {
    const res = await request(app).get('/api/mailboxes/postmaster');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('RESERVED_USERNAME');
  });
});

describe('request ids and error format', () => {
  it('generates a request id and echoes it in errors', async () => {
    const res = await request(app).get('/api/mailboxes/john/messages/missing');
    expect(res.status).toBe(404);
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body).toEqual({
      error: 'Message not found',
      code: 'MESSAGE_NOT_FOUND',
      requestId: res.headers['x-request-id'],
    });
  });

  it('propagates a well-formed upstream request id', async () => {
    const res = await request(app).get('/api/nope').set('X-Request-Id', 'edge-123');
    expect(res.headers['x-request-id']).toBe('edge-123');
    expect(res.body.requestId).toBe('edge-123');
  });

  it('replaces a malformed upstream request id', async () => {
    const res = await request(app).get('/api/nope').set('X-Request-Id', 'bad id with spaces');
    expect(res.headers['x-request-id']).not.toBe('bad id with spaces');
  });
});

describe('health probes', () => {
  it('liveness does not depend on the database', async () => {
    expect((await request(app).get('/api/health/live')).status).toBe(200);
  });

  it('readiness fails when the database is down', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ ok: false, database: 'down' });
  });

  it('serves the OpenAPI document', async () => {
    const res = await request(app).get('/api/openapi.yaml');
    expect(res.status).toBe(200);
    expect(res.text).toContain('openapi: 3.1');
  });
});

describe('SMTP connection limiter', () => {
  it('allows up to the limit per window, then resets', () => {
    const limiter = new ConnectionLimiter(2, 1000);
    expect(limiter.allow('1.1.1.1', 0)).toBe(true);
    expect(limiter.allow('1.1.1.1', 10)).toBe(true);
    expect(limiter.allow('1.1.1.1', 20)).toBe(false);
    expect(limiter.allow('2.2.2.2', 20)).toBe(true);
    expect(limiter.allow('1.1.1.1', 1000)).toBe(true);
  });
});

describe('live events (SSE)', () => {
  let server: ReturnType<typeof app.listen>;
  let base: string;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => {
    server.closeAllConnections();
    server.close();
  });

  it('pushes an event when mail arrives for the mailbox', async () => {
    const controller = new AbortController();
    const res = await fetch(`${base}/api/mailboxes/john/events`, { signal: controller.signal });
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let received = decoder.decode((await reader.read()).value);
    expect(received).toContain('retry: 5000');

    publishMail({ address: 'someone-else@mail.test', messageId: 'ignored' });
    publishMail({ address: 'john@mail.test', messageId: 'm42' });
    while (!received.includes('m42')) received += decoder.decode((await reader.read()).value);

    expect(received).toContain('event: message\ndata: {"id":"m42"}');
    expect(received).not.toContain('ignored');
    controller.abort();
  });
});
