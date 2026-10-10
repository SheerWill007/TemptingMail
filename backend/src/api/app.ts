import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
import { errorHandler, notFoundHandler } from './errors.js';
import { generalLimiter } from './rateLimit.js';
import { createRouter } from './routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.api.trustProxy);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));

  // The frontend normally reaches the API through its own /api proxy (same origin), so CORS is
  // only needed when browsers call the API directly from another origin.
  const origins = config.api.corsOrigins;
  if (origins.length) {
    app.use(
      cors({
        origin: origins.includes('*') ? true : origins,
        methods: ['GET', 'POST', 'DELETE'],
        maxAge: 600,
      }),
    );
  }

  app.use(express.json({ limit: '10kb' }));

  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      const entry = {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms: Math.round(performance.now() - start),
      };
      if (res.statusCode >= 500) logger.error(entry, 'request');
      else logger.debug(entry, 'request');
    });
    next();
  });

  app.get('/', (_req, res) => {
    res.json({ name: 'temp-mail-api', health: '/api/health' });
  });

  app.use('/api', generalLimiter, createRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
