import { object, string, TypeOf } from 'zod';

export const CreatePostSchema = object({
  title: string({
    required_error: 'Title is required.',
    invalid_type_error: 'Title must be string.',
  }).min(1, { message: 'Title cannot be empty.' }),
  content: string({
    required_error: 'Content is required.',
    invalid_type_error: 'Content must be string.',
  }).min(1, { message: 'Content cannot be empty.' }),
});

export type CreatePostData = TypeOf<typeof CreatePostSchema>;
