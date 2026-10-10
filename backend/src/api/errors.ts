import type { ErrorRequestHandler, RequestHandler } from 'express';
import { logger } from '../lib/logger.js';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // body-parser errors (malformed JSON, payload too large) carry their own status.
  const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) {
    logger.error({ err, method: req.method, path: req.path }, 'unhandled request error');
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
  res.status(status).json({ error: err.expose ? err.message : 'Bad request' });
};
