import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      MAIL_DOMAIN: 'mail.test',
      MAILBOX_CREATE_LIMIT_PER_HOUR: '3',
    },
  },
});
