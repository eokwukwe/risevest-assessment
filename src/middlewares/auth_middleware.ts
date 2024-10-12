import { NextFunction, Request, Response } from 'express';

import { HttpReponses } from '../utils';
import { SessionService } from '../services';

export const Auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const access_token = req.headers.authorization?.split(' ')[1];

    if (!access_token) {
      return HttpReponses.unAuthorized(res, 'Missing Authentication token.');
    }

    const user = await SessionService.verify(access_token);

    if (!user) {
      return HttpReponses.unAuthorized(res, 'Invalid or expired token.');
    }

    req.user = user;
    req.access_token = access_token;

    return next();
  } catch (error) {
    return next(error);
  }
};
