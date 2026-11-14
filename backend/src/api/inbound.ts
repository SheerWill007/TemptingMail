import { createHash, timingSafeEqual } from 'node:crypto';
import express, { Router, type RequestHandler } from 'express';
import { config } from '../config.js';
import { trackServerEvent } from '../lib/analytics.js';
import { checkRecipient } from '../lib/email.js';
import { smtpMessages, smtpRejections } from '../lib/metrics.js';
import { storeIncomingMessage } from '../services/mailStore.js';
import { HttpError } from './errors.js';

/** Compares secrets in constant time (hashing first so lengths always match). */
function secretMatches(given: string, expected: string) {
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

const requireSecret: RequestHandler = (req, _res, next) => {
  const expected = config.inbound.secret;
  if (!expected) throw new HttpError(404, 'Not found');
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || !secretMatches(token, expected)) throw new HttpError(401, 'Invalid inbound secret', 'UNAUTHORIZED');
  next();
};

/**
 * Inbound mail over HTTP, for hosts that cannot accept SMTP on port 25. A relay (for example a
 * Cloudflare Email Worker) POSTs the raw RFC 5322 message as the body and the envelope
 * recipients in `X-Envelope-To` (comma-separated) or `?to=`.
 */
export function createInboundRouter() {
  const router = Router();

  router.post(
    '/email',
    requireSecret,
    express.raw({ type: () => true, limit: config.smtp.maxMessageBytes }),
    async (req, res) => {
      const raw: unknown = req.body;
      if (!Buffer.isBuffer(raw) || raw.length === 0) throw new HttpError(400, 'Request body must be the raw message');

      const declared = [req.get('x-envelope-to') ?? '', typeof req.query.to === 'string' ? req.query.to : '']
        .join(',')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const accepted = new Set<string>();
      for (const address of declared.slice(0, config.smtp.maxRecipients)) {
        const check = checkRecipient(address);
        if (check.ok) accepted.add(check.address);
        else smtpRejections.inc({ reason: check.reason });
      }
      if (!accepted.size) {
        throw new HttpError(422, 'No deliverable recipients for this domain', 'NO_VALID_RECIPIENTS');
      }

      const recipients = [...accepted];
      try {
        const { ids, parsed } = await storeIncomingMessage(raw, recipients);
        smtpMessages.inc({ result: 'stored' });
        req.log.info({ recipients: recipients.length, bytes: raw.length, ids, via: 'http' }, 'message stored');
        trackServerEvent('http_email_received', {
          recipients: recipients.length,
          bytes: raw.length,
          has_html: Boolean(parsed.html),
          attachments: parsed.attachments.length,
        });
        res.status(202).json({ stored: ids.length });
      } catch (error) {
        smtpMessages.inc({ result: 'failed' });
        throw error;
      }
    },
  );

  return router;
}
