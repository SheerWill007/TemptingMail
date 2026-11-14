import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const SECRET = 'test-inbound-secret-0123456789abcdef';
vi.stubEnv('INBOUND_SECRET', SECRET);

const store = vi.hoisted(() => ({ storeIncomingMessage: vi.fn() }));
vi.mock('../src/services/mailStore.js', () => store);
vi.mock('../src/lib/prisma.js', () => ({ prisma: {} }));

const { createApp } = await import('../src/api/app.js');
const app = createApp();

const RAW = 'From: a@example.com\r\nTo: bob@mail.test\r\nSubject: Hi\r\n\r\nHello';

beforeEach(() => {
  vi.clearAllMocks();
  store.storeIncomingMessage.mockResolvedValue({ ids: ['m1'], parsed: { html: false, attachments: [] } });
});

const post = () =>
  request(app)
    .post('/api/inbound/email')
    .set('Content-Type', 'message/rfc822')
    .set('Authorization', `Bearer ${SECRET}`);

describe('POST /api/inbound/email', () => {
  it('stores mail for valid recipients and drops the rest', async () => {
    const res = await post().set('X-Envelope-To', 'Bob@Mail.test, admin@mail.test, x@other.org').send(RAW);
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ stored: 1 });
    const [raw, recipients] = store.storeIncomingMessage.mock.calls[0]!;
    expect(Buffer.isBuffer(raw) && raw.toString()).toBe(RAW);
    expect(recipients).toEqual(['bob@mail.test']);
  });

  it('accepts recipients from the query string', async () => {
    const res = await post().query({ to: 'carol@mail.test' }).send(RAW);
    expect(res.status).toBe(202);
    expect(store.storeIncomingMessage.mock.calls[0]![1]).toEqual(['carol@mail.test']);
  });

  it('rejects a wrong or missing secret', async () => {
    const wrong = await request(app)
      .post('/api/inbound/email')
      .set('Authorization', 'Bearer nope')
      .set('X-Envelope-To', 'bob@mail.test')
      .send(RAW);
    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe('UNAUTHORIZED');
    const missing = await request(app).post('/api/inbound/email').send(RAW);
    expect(missing.status).toBe(401);
    expect(store.storeIncomingMessage).not.toHaveBeenCalled();
  });

  it('returns 422 when no recipient is deliverable', async () => {
    const res = await post().set('X-Envelope-To', 'postmaster@mail.test').send(RAW);
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('NO_VALID_RECIPIENTS');
  });

  it('rejects an empty body', async () => {
    const res = await post().set('X-Envelope-To', 'bob@mail.test').send('');
    expect(res.status).toBe(400);
  });
});
