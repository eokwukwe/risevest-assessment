import { Router } from 'express';

import { CreateCommentSchema } from '../schemas';
import { PostController } from '../../controllers';
import { Auth, ValidateRequestData } from '../middlewares';

const router = Router();

router.post(
  '/:id/comments',
  Auth,
  ValidateRequestData(CreateCommentSchema),
  PostController.comment
);

export default router;
