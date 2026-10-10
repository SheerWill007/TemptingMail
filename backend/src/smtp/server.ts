import { readFileSync } from 'node:fs';
import { SMTPServer, type SMTPServerOptions } from 'smtp-server';
import { config } from '../config.js';
import { trackServerEvent } from '../lib/analytics.js';
import { isOurDomain, isReservedLocalPart, isValidLocalPart, parseAddress, toAddress } from '../lib/email.js';
import { logger } from '../lib/logger.js';
import { smtpMessages, smtpRejections } from '../lib/metrics.js';
import { storeIncomingMessage } from '../services/mailStore.js';
import { ConnectionLimiter } from './connectionLimiter.js';

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
  const limiter = new ConnectionLimiter(config.smtp.maxConnectionsPerMinute);

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

    onConnect(session, callback) {
      if (!limiter.allow(session.remoteAddress)) {
        smtpRejections.inc({ reason: 'connection_rate' });
        logger.warn({ remote: session.remoteAddress }, 'SMTP connection rate limit exceeded');
        return callback(smtpError('Too many connections, slow down', 421));
      }
      callback();
    },

    onRcptTo(address, session, callback) {
      const parsed = parseAddress(address.address);
      if (!parsed || !isOurDomain(parsed.domain)) {
        smtpRejections.inc({ reason: 'relay' });
        return callback(smtpError('Relay access denied', 550));
      }
      // Reserved role addresses (admin@, postmaster@, ...) must never land in a public inbox.
      if (!isValidLocalPart(parsed.localPart) || isReservedLocalPart(parsed.localPart)) {
        smtpRejections.inc({ reason: 'unknown_user' });
        return callback(smtpError('No such user here', 550));
      }
      if (session.envelope.rcptTo.length >= config.smtp.maxRecipients) {
        smtpRejections.inc({ reason: 'too_many_recipients' });
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
          smtpMessages.inc({ result: 'too_large' });
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
          smtpMessages.inc({ result: 'stored' });
          logger.info({ recipients: recipients.length, bytes: raw.length, ids }, 'message stored');
          trackServerEvent('smtp_email_received', {
            recipients: recipients.length,
            bytes: raw.length,
            has_html: Boolean(parsed.html),
            attachments: parsed.attachments.length,
          });
          callback();
        } catch (error) {
          smtpMessages.inc({ result: 'failed' });
          logger.error({ err: error, remote: session.remoteAddress }, 'failed to store message');
          trackServerEvent('smtp_email_failed', { bytes: length });
          callback(smtpError('Temporary failure storing message, try again later', 451));
        }
      });
    },
  });
}
