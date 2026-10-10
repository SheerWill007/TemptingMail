import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './api/app.js';
import { config } from './config.js';
import { shutdownAnalytics } from './lib/analytics.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { startCleanupScheduler } from './services/cleanup.js';
import { createSmtpServer } from './smtp/server.js';

const httpServer: Server = createApp().listen(config.api.port, config.api.host, () => {
  logger.info({ port: config.api.port, domain: config.mailDomain }, 'API listening');
});

const smtpServer = config.smtp.enabled ? createSmtpServer() : null;
smtpServer?.on('error', (error) => logger.error({ err: error }, 'SMTP server error'));
smtpServer?.listen(config.smtp.port, config.smtp.host, () => {
  logger.info({ port: config.smtp.port, hostname: config.smtp.hostname }, 'SMTP listening');
});

const stopCleanup = config.cleanup.enabled ? startCleanupScheduler(config.cleanup.intervalMs) : null;

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');

  const forceExit = setTimeout(() => {
    logger.error('graceful shutdown timed out');
    process.exit(1);
  }, 15_000);
  forceExit.unref();

  stopCleanup?.();
  await Promise.allSettled([
    new Promise<void>((resolve) => httpServer.close(() => resolve())),
    new Promise<void>((resolve) => (smtpServer ? smtpServer.close(() => resolve()) : resolve())),
  ]);
  await Promise.allSettled([prisma.$disconnect(), shutdownAnalytics()]);
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'unhandled rejection'));
