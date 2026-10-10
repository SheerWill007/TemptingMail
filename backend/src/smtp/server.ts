import { readFileSync } from 'node:fs';
import { SMTPServer, type SMTPServerOptions } from 'smtp-server';
import { config } from '../config.js';
import { trackServerEvent } from '../lib/analytics.js';
import { isOurDomain, isValidLocalPart, parseAddress, toAddress } from '../lib/email.js';
import { logger } from '../lib/logger.js';
import { storeIncomingMessage } from '../services/mailStore.js';

function smtpError(message: string, responseCode: number) {
  return Object.assign(new Error(message), { responseCode });
}

function loadTls(): Pick<SMTPServerOptions, 'key' | 'cert'> | null {
  const { tlsKeyPath, tlsCertPath } = config.smtp;
  if (!tlsKeyPath || !tlsCertPath) return null;
  return { key: readFileSync(tlsKeyPath), cert: readFileSync(tlsCertPath) };
}

/** Receive-only MX: accepts mail for MAIL_DOMAIN and refuses to relay anything else. */
export function createSmtpServer() {
  const tls = loadTls();

  return new SMTPServer({
    name: config.smtp.hostname,
    banner: 'Temp Mail ESMTP',
    size: config.smtp.maxMessageBytes,
    authOptional: true,
    disabledCommands: tls ? ['AUTH'] : ['AUTH', 'STARTTLS'],
    ...tls,
    logger: false,
    maxClients: 200,
    socketTimeout: 60_000,
    closeTimeout: 10_000,

    onRcptTo(address, session, callback) {
      const parsed = parseAddress(address.address);
      if (!parsed || !isOurDomain(parsed.domain)) {
        return callback(smtpError('Relay access denied', 550));
      }
      if (!isValidLocalPart(parsed.localPart)) {
        return callback(smtpError('No such user here', 550));
      }
      if (session.envelope.rcptTo.length >= config.smtp.maxRecipients) {
        return callback(smtpError('Too many recipients', 452));
      }
      callback();
    },

    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      let length = 0;

      stream.on('data', (chunk: Buffer) => {
        length += chunk.length;
        // smtp-server keeps reading after the limit so the client gets a proper reply; don't buffer it.
        if (length <= config.smtp.maxMessageBytes) chunks.push(chunk);
      });

      stream.on('error', (error) => callback(error));

      stream.on('end', async () => {
        if (stream.sizeExceeded) {
          return callback(smtpError('Message exceeds fixed maximum message size', 552));
        }

        const recipients = [
          ...new Set(
            session.envelope.rcptTo
              .map((r) => parseAddress(r.address))
              .filter((p): p is NonNullable<typeof p> => p !== null)
              .map((p) => toAddress(p.localPart)),
          ),
        ];

        try {
          const raw = Buffer.concat(chunks);
          const { ids, parsed } = await storeIncomingMessage(raw, recipients);
          logger.info({ recipients: recipients.length, bytes: raw.length, ids }, 'message stored');
          trackServerEvent('smtp_email_received', {
            recipients: recipients.length,
            bytes: raw.length,
            has_html: Boolean(parsed.html),
            attachments: parsed.attachments.length,
          });
          callback();
        } catch (error) {
          logger.error({ err: error, remote: session.remoteAddress }, 'failed to store message');
          trackServerEvent('smtp_email_failed', { bytes: length });
          callback(smtpError('Temporary failure storing message, try again later', 451));
        }
      });
    },
  });
}
