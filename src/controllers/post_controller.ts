import { Request, Response, NextFunction as NextFn } from 'express';

import { PostService } from '../services';
import { HttpReponses } from '../utils';

export class PostController {
  static async create(req: Request, res: Response, next: NextFn) {
    try {
      const post = await PostService.create(req.body, +req.params.id);

      return HttpReponses.created(res, post);
    } catch (error) {
      return next(error);
    }
  }

  static async comment(req: Request, res: Response, next: NextFn) {
    try {
      const post = await PostService.findById(+req.params.id);

      if (!post) {
        return HttpReponses.notFound(res, 'Post not found.');
      }

      const comment = await PostService.addComment({
        postId: post.id,
        userId: req.user!.id,
        content: req.body.content,
      });

      return HttpReponses.created(res, comment);
    } catch (error) {
      return next(error);
    }
  }
}
