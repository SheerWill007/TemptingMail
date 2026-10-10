/**
 * Sends a sample email (HTML + inline image + attachment) to the local SMTP server.
 *
 *   npm run send-test-email -- someone            -> someone@$MAIL_DOMAIN
 *   npm run send-test-email -- someone@other.tld  -> exact address
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const domain = process.env.MAIL_DOMAIN || process.env.SMTP_DOMAIN || 'localhost';
const target = process.argv[2] || 'test';
const to = target.includes('@') ? target : `${target}@${domain}`;

// 1x1 transparent PNG
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const transport = nodemailer.createTransport({
  host: process.env.SMTP_TEST_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT) || 2525,
  secure: false,
  ignoreTLS: true,
});

const info = await transport.sendMail({
  from: '"Temp Mail Tester" <tester@example.com>',
  to,
  subject: `Test message ${new Date().toLocaleTimeString()}`,
  text: 'Hello! This is a plain-text test message from the temp-mail dev script.',
  html: `
    <div style="font-family: sans-serif">
      <h2 style="color:#4f46e5">Hello from Temp Mail 👋</h2>
      <p>This is an <strong>HTML</strong> test message with an inline image:
        <img src="cid:pixel@temp-mail" width="16" height="16" alt="pixel" style="border:1px solid #ccc">
      </p>
      <p><a href="https://example.com">A link that opens in a new tab</a></p>
    </div>`,
  attachments: [
    { filename: 'pixel.png', content: pixel, cid: 'pixel@temp-mail' },
    { filename: 'notes.txt', content: 'An attached text file.\n' },
  ],
});

console.log(`Sent ${info.messageId} to ${to}`);
