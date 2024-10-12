import { object, string, TypeOf } from 'zod';

export const CreateCommentSchema = object({
  content: string({
    required_error: 'Content is required.',
    invalid_type_error: 'Content must be string.',
  }).min(1, { message: 'Comment cannot be empty.' }),
});

export type CreateCommentData = TypeOf<typeof CreateCommentSchema>;
