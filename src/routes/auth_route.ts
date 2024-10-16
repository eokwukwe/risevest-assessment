import { Router } from 'express';

import { LoginSchema } from '../schemas';
import { AuthController } from '../controllers';
import { Auth, ValidateRequestData } from '../middlewares';

const router = Router();

router.post('/login', ValidateRequestData(LoginSchema), AuthController.login);

router.delete('/logout', Auth, AuthController.logout);

export default router;
