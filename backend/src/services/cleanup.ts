import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

export async function cleanupExpired(now = new Date()) {
  const messages = await prisma.message.deleteMany({ where: { expiresAt: { lt: now } } });
  // Deleting a mailbox cascades to any remaining messages.
  const mailboxes = await prisma.mailbox.deleteMany({ where: { expiresAt: { lt: now } } });
  return { messages: messages.count, mailboxes: mailboxes.count };
}

/** Runs cleanup on a fixed interval. Safe to run on several instances at once (deletes are idempotent). */
export function startCleanupScheduler(intervalMs: number) {
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      const result = await cleanupExpired();
      if (result.messages || result.mailboxes) logger.info(result, 'cleanup removed expired data');
      else logger.debug('cleanup: nothing to remove');
    } catch (error) {
      logger.error({ err: error }, 'cleanup failed');
    } finally {
      running = false;
    }
  };

  const initial = setTimeout(run, 10_000);
  const timer = setInterval(run, intervalMs);
  initial.unref();
  timer.unref();
  logger.info({ intervalMinutes: Math.round(intervalMs / 60_000) }, 'cleanup scheduler started');

  return () => {
    clearTimeout(initial);
    clearInterval(timer);
  };
}
