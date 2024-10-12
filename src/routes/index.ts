import { Router } from 'express';

import authRoutes from './auth_route';
import userRoutes from './user_route';
import postRoutes from './post_route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router;
