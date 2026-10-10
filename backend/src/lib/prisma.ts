import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { config } from '../config.js';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
  log: ['warn', 'error'],
});

export type { Mailbox, Message } from '../generated/prisma/client.js';
