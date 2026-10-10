/**
 * End-to-end: SMTP delivery -> Postgres -> live event -> HTTP API -> cleanup.
 * Needs a migrated database: TEST_DATABASE_URL=postgresql://... npm run test:integration
 */
import type { AddressInfo } from 'node:net';
import nodemailer, { type Transporter } from 'nodemailer';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)('mail flow (integration)', async () => {
  if (!databaseUrl) return;
  process.env.DATABASE_URL = databaseUrl;
  process.env.REALTIME_PG_NOTIFY = 'false';

  const { createApp } = await import('../../src/api/app.js');
  const { createSmtpServer } = await import('../../src/smtp/server.js');
  const { cleanupExpired } = await import('../../src/services/cleanup.js');
  const { subscribe } = await import('../../src/services/events.js');
  const { prisma } = await import('../../src/lib/prisma.js');

  const app = createApp();
  const smtp = createSmtpServer();
  const name = `it-${Date.now()}`;
  const address = `${name}@mail.test`;
  let transport: Transporter;

  const PIXEL = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );

  beforeAll(async () => {
    await new Promise<void>((resolve) => smtp.listen(0, '127.0.0.1', resolve));
    const { port } = smtp.server.address() as AddressInfo;
    transport = nodemailer.createTransport({ host: '127.0.0.1', port, secure: false, ignoreTLS: true });
  });

  afterAll(async () => {
    await prisma.mailbox.deleteMany({ where: { address } });
    await new Promise<void>((resolve) => smtp.close(() => resolve()));
    await prisma.$disconnect();
  });

  it('creates the mailbox', async () => {
    const res = await request(app).post('/api/mailboxes').send({ username: name });
    expect(res.status).toBe(201);
    expect(res.body.address).toBe(address);
  });

  it('delivers mail over SMTP and announces it in real time', async () => {
    const event = new Promise<string>((resolve) => {
      const off = subscribe(address, (e) => {
        off();
        resolve(e.messageId);
      });
    });

    await transport.sendMail({
      from: 'Integration <it@example.com>',
      to: address,
      subject: 'Integration test',
      text: 'Plain body',
      html: '<p>Hello <img src="cid:px@it"></p>',
      attachments: [
        { filename: 'px.png', content: PIXEL, cid: 'px@it' },
        { filename: 'notes.txt', content: 'notes' },
      ],
    });

    const messageId = await event;
    const inbox = await request(app).get(`/api/mailboxes/${name}`);
    expect(inbox.body.exists).toBe(true);
    expect(inbox.body.messages).toHaveLength(1);
    expect(inbox.body.messages[0]).toMatchObject({
      id: messageId,
      subject: 'Integration test',
      preview: 'Plain body',
      hasAttachments: true,
      isRead: false,
    });
  });

  it('serves the message, inline image, attachment and raw source', async () => {
    const { body: inbox } = await request(app).get(`/api/mailboxes/${name}`);
    const id = inbox.messages[0].id as string;
    const base = `/api/mailboxes/${name}/messages/${id}`;

    const detail = await request(app).get(base);
    expect(detail.status).toBe(200);
    expect(detail.body.html).toContain(`${base}/attachments/0`);
    expect(detail.body.attachments.map((a: { filename: string }) => a.filename)).toEqual(['px.png', 'notes.txt']);

    const image = await request(app).get(`${base}/attachments/0`);
    expect(image.headers['content-type']).toBe('image/png');
    expect(image.headers['content-disposition']).toBe('inline');

    const file = await request(app).get(`${base}/attachments/1`);
    expect(file.headers['content-disposition']).toMatch(/^attachment; filename="?notes\.txt"?$/);

    const raw = await request(app).get(`${base}/raw`).responseType('blob');
    expect(raw.headers['content-type']).toContain('message/rfc822');
    expect((raw.body as Buffer).toString()).toContain('Subject: Integration test');

    const reread = await request(app).get(`/api/mailboxes/${name}`);
    expect(reread.body.messages[0].isRead).toBe(true);
  });

  it('rejects relaying and reserved recipients at the SMTP level', async () => {
    await expect(
      transport.sendMail({ from: 'x@example.com', to: 'victim@other.test', subject: 'relay', text: 'x' }),
    ).rejects.toThrow(/550/);
    await expect(
      transport.sendMail({ from: 'x@example.com', to: 'admin@mail.test', subject: 'cert', text: 'x' }),
    ).rejects.toThrow(/550/);
  });

  it('removes expired mailboxes and their messages', async () => {
    await prisma.mailbox.update({ where: { address }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const result = await cleanupExpired();
    expect(result.mailboxes).toBeGreaterThanOrEqual(1);
    expect(await prisma.message.count({ where: { mailbox: { address } } })).toBe(0);
    const inbox = await request(app).get(`/api/mailboxes/${name}`);
    expect(inbox.body.exists).toBe(false);
  });
});
