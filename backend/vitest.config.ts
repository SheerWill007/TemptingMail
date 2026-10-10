import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // Integration tests share one database; keep files sequential.
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      MAIL_DOMAIN: 'mail.test',
      MAILBOX_CREATE_LIMIT_PER_HOUR: '3',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/types/**', 'src/index.ts'],
      reporter: ['text-summary', 'lcov'],
      // Measured with integration tests enabled (as in CI). Raise these as coverage improves.
      thresholds: { lines: 65, statements: 62, functions: 65, branches: 50 },
    },
  },
});
