import config from 'config';
import { User } from '@prisma/client';
import { Hashing, redisClient } from '../utils';

export interface SessionPayload extends Omit<User, 'password'> {
  hashedToken: string;
}

export type SessionUser = Omit<User, 'password'>;

export class SessionService {
  static async create(user: Partial<SessionUser>): Promise<string> {
    const plainToken = Hashing.plainToken();

    await redisClient.set(
      plainToken,
      JSON.stringify({ ...user, hashedToken: await Hashing.hash(plainToken) }),
      { EX: config.get<number>('accessTokenExpiresIn') * 60 }
    );

    return plainToken;
  }

  static async verify(token: string): Promise<SessionUser | null> {
    const session = await redisClient.get(token);

    if (!session) {
      return null;
    }

    const { hashedToken, ...userInfo } = JSON.parse(session) as SessionPayload;

    if (!(await Hashing.compare(token, hashedToken))) {
      return null;
    }

    return userInfo;
  }

  static async delete(token: string) {
    return await redisClient.del(token);
  }
}
