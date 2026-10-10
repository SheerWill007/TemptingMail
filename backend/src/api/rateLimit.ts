import { rateLimit, type Options } from 'express-rate-limit';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

const shared: Partial<Options> = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Keys on req.ip, which honours the TRUST_PROXY setting (and groups IPv6 by /56).
  handler: (req, res, _next, options) => {
    logger.warn({ ip: req.ip, path: req.path }, 'rate limit exceeded');
    res.status(options.statusCode).json(options.message);
  },
};

/** Applies to every API request. */
export const generalLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 1000,
  limit: config.api.rateLimitPerMinute,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
  skip: (req) => req.path === '/health',
});

/** Only requests that actually create a mailbox (HTTP 201) count against this limit. */
export const createMailboxLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: config.api.createLimitPerHour,
  message: { error: 'Too many new mailboxes from your network. Please try again in an hour.' },
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_req, res) => res.statusCode !== 201,
});
