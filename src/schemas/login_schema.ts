import { object, string, TypeOf } from 'zod';

export const LoginSchema = object({
  email: string({
    required_error: 'Email is required.',
  }).email('Invalid email address.'),
  password: string({
    invalid_type_error: 'Password must be a string.',
    required_error: 'Password is required.',
  }).min(8, { message: 'Password must be at least 8 characters long.' }),
});

export type LoginUserData = TypeOf<typeof LoginSchema>;
