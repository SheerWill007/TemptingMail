import { pino } from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.env === 'test' ? 'silent' : config.logLevel,
  // Pretty output locally; JSON lines in production for log aggregation.
  ...(config.env === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } },
  }),
});
