import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

import { Logger } from './logger';
import { Hashing } from './hashing';

const prismaClient = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'query', emit: 'event' },
  ],
  errorFormat: 'pretty',
  omit: {
    user: { password: true },
  },
});

prismaClient.$on('query', (e) => Logger.info(e));
prismaClient.$on('error', (e) => Logger.error(e));

const clientWithExtension = prismaClient
  .$extends({
    query: {
      // intercept and hash passwords before save
      user: {
        async create({ model, operation, args, query }) {
          args.data.password = await Hashing.hash(args.data.password);

          return query(args);
        },
        async update({ model, operation, args, query }) {
          if (args.data.password) {
            if (typeof args.data.password === 'string') {
              args.data.password = await Hashing.hash(args.data.password);
            } else if (args.data.password.set) {
              args.data.password.set = await Hashing.hash(
                args.data.password.set
              );
            }
          }

          return query(args);
        },
      },
    },
  })
  .$extends(
    pagination({
      pages: {
        limit: 30,
        includePageCount: true,
      },
    })
  );

export const prisma = clientWithExtension;
