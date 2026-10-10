import { PostHog } from 'posthog-node';
import { config } from '../config.js';
import { logger } from './logger.js';

/** Optional, privacy-preserving analytics. Disabled unless POSTHOG_KEY is set; never sent addresses or content. */
const client = config.posthog.key
  ? new PostHog(config.posthog.key, { host: config.posthog.host, flushAt: 20, flushInterval: 30_000 })
  : null;

export function trackServerEvent(event: string, properties: Record<string, string | number | boolean> = {}) {
  if (!client) return;
  try {
    client.capture({
      distinctId: 'server',
      event,
      properties: { ...properties, environment: config.env },
    });
  } catch (error) {
    logger.warn({ err: error }, 'analytics capture failed');
  }
}

export async function shutdownAnalytics() {
  await client?.shutdown();
}
