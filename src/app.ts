import cors from 'cors';
import morgan from 'morgan';
import rateLimiter from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import express, { Response, Request, NextFunction } from 'express';

import apiRoutes from './routes';
import { Logger, ErrorHandler, HttpReponses, redisClient } from './utils';

export function createApp(port: number) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(morgan('dev'));

  app.use(
    rateLimiter({
      windowMs: 60 * 1000,
      max: 60,
      handler: (_, res) => {
        return res
          .status(StatusCodes.TOO_MANY_REQUESTS)
          .json({ errors: [{ message: 'Too many requests!' }] });
      },
    })
  );

  app.get('/', async (req: Request, res: Response) => {
    const message = await redisClient.get('check');

    return HttpReponses.ok(res, { message: message! });
  });

  app.use('/api', apiRoutes);

  // UNHANDLED ROUTE
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const message = `Route ${req.originalUrl} not found`;

    Logger.error(message);

    return HttpReponses.notFound(res, message);
  });

  // GLOBAL ERROR HANDLER
  app.use(ErrorHandler);

  app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
  });
}
