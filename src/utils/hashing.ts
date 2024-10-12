import crypto from 'crypto';
import bycrypt from 'bcryptjs';

import config from 'config';

export class Hashing {
  static async hash(plainTxt: string): Promise<string> {
    const salt = config.get<number>('hashSaltFactor');

    return await bycrypt.hash(plainTxt, +salt);
  }

  static async compare(plainTxt: string, hashedTxt: string): Promise<boolean> {
    return await bycrypt.compare(plainTxt, hashedTxt);
  }

  static plainToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
