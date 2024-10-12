import { Request, Response, NextFunction } from 'express';

import { Logger } from './logger';
import { HttpReponses } from './http_reponses';

export function ErrorHandler(
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === 'production';

  const status = error.status || false;
  const statusCode = error.statusCode || 500;
  const message =
    isProduction && statusCode === 500
      ? 'Something went wrong.'
      : error.message;

  Logger.error(error.message);

  return HttpReponses.response(res, {
    code: statusCode,
    message: message,
    status: status,
  });
}
