import { createServer, type Server } from 'node:http';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';
import { config } from '../config.js';
import { logger } from './logger.js';

export const registry = new Registry();
registry.setDefaultLabels({ service: 'temp-mail-backend' });
collectDefaultMetrics({ register: registry });

export const httpRequests = new Counter({
  name: 'tempmail_http_requests_total',
  help: 'HTTP requests by method, route template and status code',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
});

export const httpDuration = new Histogram({
  name: 'tempmail_http_request_duration_seconds',
  help: 'HTTP request latency by method and route template',
  labelNames: ['method', 'route'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

export const smtpMessages = new Counter({
  name: 'tempmail_smtp_messages_total',
  help: 'Incoming SMTP messages by outcome (stored, too_large, failed)',
  labelNames: ['result'] as const,
  registers: [registry],
});

export const smtpRejections = new Counter({
  name: 'tempmail_smtp_rejections_total',
  help: 'Rejected SMTP connections and recipients by reason',
  labelNames: ['reason'] as const,
  registers: [registry],
});

export const mailboxesCreated = new Counter({
  name: 'tempmail_mailboxes_created_total',
  help: 'Mailboxes created through the API',
  registers: [registry],
});

export const cleanupDeleted = new Counter({
  name: 'tempmail_cleanup_deleted_total',
  help: 'Rows removed by the expiry cleanup job',
  labelNames: ['kind'] as const,
  registers: [registry],
});

export const sseClients = new Gauge({
  name: 'tempmail_sse_clients',
  help: 'Open real-time (Server-Sent Events) connections',
  registers: [registry],
});

/** Serves /metrics on its own port so it is never exposed through the public reverse proxy. */
export function startMetricsServer(): Server | null {
  const { port, host } = config.metrics;
  if (!port) return null;

  const server = createServer(async (req, res) => {
    if (req.url !== '/metrics') {
      res.writeHead(404).end();
      return;
    }
    try {
      res.writeHead(200, { 'Content-Type': registry.contentType }).end(await registry.metrics());
    } catch (error) {
      logger.error({ err: error }, 'failed to collect metrics');
      res.writeHead(500).end();
    }
  });
  server.listen(port, host, () => logger.info({ port, host }, 'metrics listening'));
  return server;
}
