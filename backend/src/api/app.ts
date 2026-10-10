import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { httpDuration, httpRequests } from '../lib/metrics.js';
import { errorHandler, notFoundHandler } from './errors.js';
import { generalLimiter } from './rateLimit.js';
import { createRouter } from './routes.js';

const REQUEST_ID_RE = /^[\w.-]{1,128}$/;

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.api.trustProxy);

  // Correlation id for logs and error responses; honour a well-formed id from an upstream proxy.
  app.use((req, res, next) => {
    const incoming = req.get('x-request-id');
    req.id = incoming && REQUEST_ID_RE.test(incoming) ? incoming : randomUUID();
    req.log = logger.child({ requestId: req.id });
    res.set('X-Request-Id', req.id);
    next();
  });

  // Access log + metrics. Routes are labelled by template (/mailboxes/:name), never by address.
  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      const seconds = (performance.now() - start) / 1000;
      const route = req.route ? `${req.baseUrl}${String(req.route.path)}` : 'unmatched';
      httpRequests.inc({ method: req.method, route, status: res.statusCode });
      httpDuration.observe({ method: req.method, route }, seconds);
      const entry = { method: req.method, route, status: res.statusCode, ms: Math.round(seconds * 1000) };
      if (res.statusCode >= 500) req.log.error(entry, 'request');
      else req.log.debug(entry, 'request');
    });
    next();
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));

  // The frontend normally reaches the API through its own /api proxy (same origin), so CORS is
  // only needed when browsers call the API directly from another origin.
  const origins = config.api.corsOrigins;
  if (origins.length) {
    app.use(
      cors({
        origin: origins.includes('*') ? true : origins,
        methods: ['GET', 'POST', 'DELETE'],
        exposedHeaders: ['X-Request-Id'],
        maxAge: 600,
      }),
    );
  }

  app.use(express.json({ limit: '10kb' }));

  app.get('/', (_req, res) => {
    res.json({ name: 'temp-mail-api', health: '/api/health', docs: '/api/openapi.yaml' });
  });

  app.use('/api', generalLimiter, createRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
