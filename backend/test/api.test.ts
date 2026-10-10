import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({
  ensureMailbox: vi.fn(),
  getInbox: vi.fn(),
  findMessage: vi.fn(),
  markRead: vi.fn(),
  deleteMessage: vi.fn(),
  deleteMailbox: vi.fn(),
  parseRaw: vi.fn(),
}));

vi.mock('../src/services/mailStore.js', () => store);
vi.mock('../src/lib/prisma.js', () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) },
}));

const { createApp } = await import('../src/api/app.js');
const app = createApp();

const mailbox = (address: string) => ({
  id: 'mb1',
  address,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  expiresAt: new Date('2026-01-02T00:00:00Z'),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/health and /api/config', () => {
  it('reports healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, database: 'up' });
  });

  it('exposes public config', async () => {
    const res = await request(app).get('/api/config');
    expect(res.body).toEqual({ domain: 'mail.test', ttlHours: 24, maxMessageBytes: 10 * 1024 * 1024 });
  });
});

describe('POST /api/mailboxes', () => {
  it('creates a mailbox for a valid username', async () => {
    store.ensureMailbox.mockResolvedValue({ mailbox: mailbox('john@mail.test'), created: true });
    const res = await request(app).post('/api/mailboxes').send({ username: ' John ' });
    expect(res.status).toBe(201);
    expect(store.ensureMailbox).toHaveBeenCalledWith('john');
    expect(res.body).toMatchObject({ username: 'john', address: 'john@mail.test' });
  });

  it('returns 200 for an existing mailbox', async () => {
    store.ensureMailbox.mockResolvedValue({ mailbox: mailbox('john@mail.test'), created: false });
    const res = await request(app).post('/api/mailboxes').send({ username: 'john' });
    expect(res.status).toBe(200);
  });

  it('generates a random name when none is given', async () => {
    store.ensureMailbox.mockImplementation(async (name: string) => ({
      mailbox: mailbox(`${name}@mail.test`),
      created: false,
    }));
    const res = await request(app).post('/api/mailboxes').send({});
    expect(res.status).toBe(200);
    expect(res.body.username).toMatch(/^[a-z]+-[a-z]+-\d{4}$/);
  });

  it.each([{ username: '../etc' }, { username: 'a b' }, { username: 42 }])('rejects %j', async (body) => {
    const res = await request(app).post('/api/mailboxes').send(body);
    expect(res.status).toBe(400);
    expect(store.ensureMailbox).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app).post('/api/mailboxes').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });

  it('rate limits creations but not re-opening existing mailboxes', async () => {
    const limited = (await import('../src/api/app.js')).createApp();
    store.ensureMailbox.mockResolvedValue({ mailbox: mailbox('x@mail.test'), created: false });
    for (let i = 0; i < 5; i++) {
      expect((await request(limited).post('/api/mailboxes').send({ username: 'x' })).status).toBe(200);
    }
    store.ensureMailbox.mockResolvedValue({ mailbox: mailbox('x@mail.test'), created: true });
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      statuses.push((await request(limited).post('/api/mailboxes').send({ username: `n${i}` })).status);
    }
    // MAILBOX_CREATE_LIMIT_PER_HOUR=3 in vitest.config.ts; the limiter store is shared per process.
    expect(statuses).toContain(429);
  });
});

describe('mailbox and message routes', () => {
  it('returns the inbox', async () => {
    store.getInbox.mockResolvedValue({ address: 'john@mail.test', exists: false, messages: [] });
    const res = await request(app).get('/api/mailboxes/john');
    expect(res.status).toBe(200);
    expect(store.getInbox).toHaveBeenCalledWith('john');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('rejects invalid mailbox names', async () => {
    const res = await request(app).get('/api/mailboxes/..evil');
    expect(res.status).toBe(400);
  });

  it('404s for unknown messages', async () => {
    store.findMessage.mockResolvedValue(null);
    const res = await request(app).get('/api/mailboxes/john/messages/abc');
    expect(res.status).toBe(404);
  });

  it('returns message detail with cid images rewritten', async () => {
    store.findMessage.mockResolvedValue({
      id: 'm1',
      from: 'Alice <alice@example.com>',
      subject: 'Hi',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      size: 123,
      isRead: false,
      raw: new Uint8Array(),
    });
    store.parseRaw.mockResolvedValue({
      html: '<img src="cid:logo@x">',
      text: 'Hi',
      date: new Date('2026-01-01T00:00:00Z'),
      attachments: [
        { filename: 'logo.png', contentType: 'image/png', size: 10, contentId: '<logo@x>', related: true },
      ],
    });
    const res = await request(app).get('/api/mailboxes/john/messages/m1');
    expect(res.status).toBe(200);
    expect(res.body.html).toBe('<img src="/api/mailboxes/john/messages/m1/attachments/0">');
    expect(res.body.attachments[0]).toMatchObject({ filename: 'logo.png', inline: true });
    expect(store.markRead).toHaveBeenCalledWith('m1');
  });

  it('forces download for non-image attachments', async () => {
    store.findMessage.mockResolvedValue({ id: 'm1', raw: new Uint8Array() });
    store.parseRaw.mockResolvedValue({
      attachments: [{ filename: 'evil".html', contentType: 'text/html', content: Buffer.from('<script>') }],
    });
    const res = await request(app).get('/api/mailboxes/john/messages/m1/attachments/0');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/^attachment;/);
    expect(res.headers['content-security-policy']).toContain('sandbox');
  });

  it('deletes messages', async () => {
    store.deleteMessage.mockResolvedValue(true);
    expect((await request(app).delete('/api/mailboxes/john/messages/m1')).status).toBe(204);
    store.deleteMessage.mockResolvedValue(false);
    expect((await request(app).delete('/api/mailboxes/john/messages/m1')).status).toBe(404);
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});
