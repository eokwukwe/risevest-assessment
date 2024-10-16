import { Router } from 'express';

import { Auth, ValidateRequestData } from '../middlewares';
import { PostController, UserController } from '../controllers';
import {
  CreatePostSchema,
  CreateUserSchema,
  QueryParamSchema,
} from '../schemas';

const router = Router();

router.post('/', ValidateRequestData(CreateUserSchema), UserController.create);

router.get(
  '/',
  Auth,
  ValidateRequestData(QueryParamSchema),
  UserController.all
);

router.post(
  '/:id/posts',
  Auth,
  ValidateRequestData(CreatePostSchema),
  PostController.create
);

router.get(
  '/:id/posts',
  Auth,
  ValidateRequestData(QueryParamSchema),
  UserController.posts
);

router.get('/topthree/comments', Auth, UserController.topUsersComment);

export default router;
