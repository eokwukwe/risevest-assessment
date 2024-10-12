import { Request, Response, NextFunction as NextFn } from 'express';
import { SessionService, UserService } from '../src/services';
import { StatusCodes } from 'http-status-codes';
import { Hashing, HttpReponses } from '../src/utils';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFn) {
    try {
      const user = await UserService.findOne({ email: req.body.email });

      if (!user) {
        return HttpReponses.unprocessableEntity(res, {
          email: 'Email does not exist.',
        });
      }

      if (!(await Hashing.compare(req.body.password, user.password))) {
        return HttpReponses.unprocessableEntity(res, {
          email: 'Invalid credentials.',
        });
      }

      return HttpReponses.ok(res, {
        data: { token: await SessionService.create(user) },
        message: 'Login successful.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFn) {
    try {
      await SessionService.delete(req.access_token!);
      req.user = null;
      req.access_token = null;

      return HttpReponses.ok(res, {
        message: 'Logout successful.',
      });
    } catch (error) {
      next(error);
    }
  }
}
