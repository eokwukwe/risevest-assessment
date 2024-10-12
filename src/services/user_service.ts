import { User, Post, Prisma } from '@prisma/client';
import { getTopThreeUsersRecentComment } from '@prisma/client/sql';

import { prisma } from '../utils';
import { CreateUserData, QueryParams } from '../schemas';
import {
  PageNumberCounters,
  PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';

export type UserWithoutPassword = Omit<User, 'password'>;

export class UserService {
  static async create(data: CreateUserData): Promise<UserWithoutPassword> {
    return await prisma.user.create({ data });
  }

  static async createMany(
    data: CreateUserData[]
  ): Promise<UserWithoutPassword[]> {
    return await prisma.user.createManyAndReturn({ data });
  }

  static async findOne(
    where: Prisma.Exact<
      Prisma.UserWhereUniqueInput,
      Prisma.UserWhereUniqueInput
    >
  ): Promise<User | null> {
    return await prisma.user.findUnique({
      omit: { password: false },
      where: { id: where.id, email: where.email },
    });
  }

  static async findMany(query: QueryParams): Promise<{
    users: User[];
    meta: PageNumberPagination & PageNumberCounters;
  }> {
    const [users, meta] = await prisma.user
      .paginate()
      .withPages(this.sanitizeQueryParam(query));

    return { users, meta };
  }

  static async findOneWithPosts(
    userId: number,
    query: QueryParams
  ): Promise<{
    posts: Post[];
    meta: PageNumberPagination & PageNumberCounters;
  }> {
    const [posts, meta] = await prisma.post
      .paginate({
        where: { userId },
      })
      .withPages(this.sanitizeQueryParam(query));

    return { posts, meta };
  }

  static async findTop3UsersRecentComment(): Promise<
    getTopThreeUsersRecentComment.Result[]
  > {
    return await prisma.$queryRawTyped(getTopThreeUsersRecentComment());
  }

  static sanitizeQueryParam(query: QueryParams) {
    return {
      limit: query.per_page ? Number(query.per_page) : 20,
      page: query.page ? Number(query.page) : 1,
    };
  }
}
