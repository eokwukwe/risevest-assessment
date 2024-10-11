import { Request, Response, NextFunction } from 'express';

import { Logger } from './logger';
import { HttpError } from './http_error';

export function ErrorHandler(
  error: HttpError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === 'production';

  error.status = error.status || false;
  error.statusCode = error.statusCode || 500;

  Logger.error({ error });

  if (isProduction && error.statusCode === 500) {
    res.status(error.statusCode).json({
      status: error.status,
      message: 'Something went wrong.',
    });
  } else if (error.statusCode === 500) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error,
    });
  } else {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
}
