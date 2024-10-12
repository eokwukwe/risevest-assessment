import { number, object, string, TypeOf, z } from 'zod';

import { prisma } from '../utils';

export const CreateUserSchema = object({
  name: string({
    required_error: 'Name is required.',
    invalid_type_error: 'Name must be a string.',
  }),
  email: string({
    required_error: 'Email is required.',
  }).email('Invalid email address.'),
  password: string({
    required_error: 'Password is required.',
    invalid_type_error: 'Password must be a string.',
  })
    .min(8, 'Password must be more than 8 characters.')
    .max(32, 'Password must be less than 32 characters.'),
}).superRefine(async (data, ctx) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (user !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email already exists.',
      path: ['email'],
    });
  }
});

export const QueryParamSchema = object({
  page: number({
    invalid_type_error: 'Page must be a number',
    coerce: true,
  }).default(1),
  per_page: number({
    invalid_type_error: 'Per page must be a number',
    coerce: true,
  }).default(30),
});

export type QueryParams = TypeOf<typeof QueryParamSchema>;
export type CreateUserData = TypeOf<typeof CreateUserSchema>;
