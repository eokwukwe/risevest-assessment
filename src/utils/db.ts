import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

import { Logger } from './logger';

const prismaClient = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'query', emit: 'event' },
  ],
  errorFormat: 'pretty',
});

prismaClient.$extends(pagination());

prismaClient.$on('query', (e) => Logger.info(e));
prismaClient.$on('error', (e) => Logger.error(e));

export const prisma = prismaClient;
