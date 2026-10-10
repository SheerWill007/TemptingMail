import { z } from 'zod';

const bool = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0', 'yes', 'no'])
    .optional()
    .transform((v) => (v === undefined ? fallback : ['true', '1', 'yes'].includes(v)));

const csv = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean),
  );

/** Express `trust proxy` accepts a boolean, a hop count, or a list of subnets/keywords. */
const trustProxy = z
  .string()
  .optional()
  .transform((v): boolean | number | string => {
    if (v === undefined) return 'loopback';
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (/^\d+$/.test(v)) return Number(v);
    return v;
  });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Domain that receives mail, e.g. "mail.example.com". SMTP_DOMAIN is accepted for backwards compatibility.
  MAIL_DOMAIN: z
    .string()
    .min(1, 'MAIL_DOMAIN is required')
    .transform((v) => v.trim().toLowerCase().replace(/\.$/, '')),

  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGINS: csv,
  TRUST_PROXY: trustProxy,

  SMTP_ENABLED: bool(true),
  SMTP_HOST: z.string().default('0.0.0.0'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(2525),
  SMTP_HOSTNAME: z.string().optional(),
  SMTP_MAX_MESSAGE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  SMTP_MAX_RECIPIENTS: z.coerce.number().int().positive().default(50),
  SMTP_TLS_KEY_PATH: z.string().optional(),
  SMTP_TLS_CERT_PATH: z.string().optional(),

  MAILBOX_TTL_HOURS: z.coerce.number().positive().max(24 * 30).default(24),
  MAILBOX_CREATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(20),
  API_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),

  CLEANUP_ENABLED: bool(true),
  CLEANUP_INTERVAL_MINUTES: z.coerce.number().positive().default(15),

  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.url().default('https://us.i.posthog.com'),
});

function load() {
  const env: Record<string, string | undefined> = { ...process.env };
  if (!env.MAIL_DOMAIN && env.SMTP_DOMAIN) env.MAIL_DOMAIN = env.SMTP_DOMAIN;
  // Treat `FOO=` in an .env file as unset so defaults apply.
  for (const key of Object.keys(env)) {
    if (env[key] === '') delete env[key];
  }

  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }

  const e = parsed.data;
  return {
    env: e.NODE_ENV,
    logLevel: e.LOG_LEVEL,
    databaseUrl: e.DATABASE_URL,
    mailDomain: e.MAIL_DOMAIN,
    mailboxTtlMs: e.MAILBOX_TTL_HOURS * 60 * 60 * 1000,
    api: {
      host: e.API_HOST,
      port: e.API_PORT,
      corsOrigins: e.CORS_ORIGINS,
      trustProxy: e.TRUST_PROXY,
      createLimitPerHour: e.MAILBOX_CREATE_LIMIT_PER_HOUR,
      rateLimitPerMinute: e.API_RATE_LIMIT_PER_MINUTE,
    },
    smtp: {
      enabled: e.SMTP_ENABLED,
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      hostname: e.SMTP_HOSTNAME ?? e.MAIL_DOMAIN,
      maxMessageBytes: e.SMTP_MAX_MESSAGE_BYTES,
      maxRecipients: e.SMTP_MAX_RECIPIENTS,
      tlsKeyPath: e.SMTP_TLS_KEY_PATH,
      tlsCertPath: e.SMTP_TLS_CERT_PATH,
    },
    cleanup: {
      enabled: e.CLEANUP_ENABLED,
      intervalMs: e.CLEANUP_INTERVAL_MINUTES * 60 * 1000,
    },
    posthog: {
      key: e.POSTHOG_KEY,
      host: e.POSTHOG_HOST,
    },
  };
}

export const config = load();
export type Config = typeof config;
