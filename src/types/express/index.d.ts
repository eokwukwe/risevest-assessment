import { User } from '@prisma/client';
import { SessionUser } from '../../services';

declare global {
  namespace Express {
    export interface Request {
      user: SessionUser | null;
      access_token: string | null;
    }
  }
}
