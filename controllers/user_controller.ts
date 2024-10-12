import { Request, Response, NextFunction as NextFn } from 'express';

import { HttpReponses } from '../src/utils';
import { QueryParams } from '../src/schemas';
import { UserService } from '../src/services';

export class UserController {
  static async all(req: Request, res: Response, next: NextFn) {
    try {
      const query = req.query as any as QueryParams;

      const result = await UserService.findMany(query);

      return HttpReponses.ok(res, { data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFn) {
    try {
      const user = await UserService.create(req.body);

      return HttpReponses.created(res, user);
    } catch (error) {
      return next(error);
    }
  }

  static async topUsersComment(req: Request, res: Response, next: NextFn) {
    try {
      const result = await UserService.findTop3UsersRecentComment();

      return HttpReponses.ok(res, { data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async posts(req: Request, res: Response, next: NextFn) {
    try {
      const query = req.query as any as QueryParams;

      const user = await UserService.findOne({ id: +req.params.id });

      if (!user) {
        return HttpReponses.notFound(res, 'User not found.');
      }

      const result = await UserService.findOneWithPosts(user.id, query);

      return HttpReponses.ok(res, { data: result });
    } catch (error) {
      return next(error);
    }
  }
}
