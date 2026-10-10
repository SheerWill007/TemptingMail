import type { Logger } from 'pino';

declare module 'express-serve-static-core' {
  interface Request {
    /** Correlation id: the incoming X-Request-Id (if well-formed) or a generated UUID. */
    id: string;
    /** Logger bound to this request's id. */
    log: Logger;
  }
}
