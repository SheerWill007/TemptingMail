import type { ErrorRequestHandler, RequestHandler } from 'express';

/** Stable, machine-readable error codes returned as `code` in every error response. */
export type ErrorCode =
  | 'BAD_REQUEST'
  | 'INVALID_USERNAME'
  | 'RESERVED_USERNAME'
  | 'NOT_FOUND'
  | 'MESSAGE_NOT_FOUND'
  | 'ATTACHMENT_NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'REALTIME_UNAVAILABLE'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

const DEFAULT_CODES: Record<number, ErrorCode> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  413: 'PAYLOAD_TOO_LARGE',
  429: 'RATE_LIMITED',
  503: 'SERVICE_UNAVAILABLE',
};

export class HttpError extends Error {
  readonly code: ErrorCode;

  constructor(
    readonly status: number,
    message: string,
    code?: ErrorCode,
  ) {
    super(message);
    this.code = code ?? DEFAULT_CODES[status] ?? 'INTERNAL_ERROR';
  }
}

/** Error body shape: `{ error, code, requestId }`. */
export function errorBody(message: string, code: ErrorCode, requestId: string) {
  return { error: message, code, requestId };
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json(errorBody('Not found', 'NOT_FOUND', req.id));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (res.headersSent) {
    res.end();
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json(errorBody(err.message, err.code, req.id));
    return;
  }
  // body-parser errors (malformed JSON, payload too large) carry their own 4xx status.
  const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) {
    req.log.error({ err, method: req.method, path: req.path }, 'unhandled request error');
    res.status(500).json(errorBody('Internal server error', 'INTERNAL_ERROR', req.id));
    return;
  }
  res
    .status(status)
    .json(errorBody(err.expose ? err.message : 'Bad request', DEFAULT_CODES[status] ?? 'BAD_REQUEST', req.id));
};
