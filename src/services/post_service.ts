import { Comment, Post } from '@prisma/client';

import { prisma } from '../utils';
import { CreateCommentData, CreatePostData } from '../schemas';

type AddCommentData = CreateCommentData & { userId: number; postId: number };

export class PostService {
  static async create(data: CreatePostData, userId: number): Promise<Post> {
    return await prisma.post.create({
      data: { ...data, userId },
    });
  }

  static async findById(id: number): Promise<Post | null> {
    return await prisma.post.findUnique({ where: { id } });
  }

  static async addComment(data: AddCommentData): Promise<Comment> {
    return await prisma.comment.create({
      data,
    });
  }
}
