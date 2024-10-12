import { test } from '@japa/runner';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

import { prisma } from '../src/utils';
import { SessionService, UserService, UserWithoutPassword } from '../src/services';

test.group('Auth Resource', (group) => {
  let token: string;
  let user: UserWithoutPassword;

  group.setup(async () => {
    await prisma.user.deleteMany();

    user = await UserService.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password',
    });

    token = await SessionService.create({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });

  group.teardown(async () => {
    await prisma.user.deleteMany();

    if (token) {
      await SessionService.delete(token);
    }
  });

  test('it validates required fields for login', async ({ client, expect }) => {
    const response = await client.post('/api/auth/login').json({});

    expect(response.status()).toBe(422);
    expect(response.body()).toMatchObject({
      status: false,
      message: 'Validation Error.',
      error: {
        email: 'Email is required.',
        password: 'Password is required.',
      },
    });
  });

  test('it successfully logs user in', async ({ client, expect }) => {
    const response = await client.post('/api/auth/login').json({
      email: user.email,
      password: 'password',
    });

    expect(response.status()).toBe(200);
    expect(response.body().status).toBeTruthy();

    token = response.body().data.token;
  });

  test('it validates access token on logout', async ({ client, expect }) => {
    const response = await client.delete('/api/auth/logout');

    expect(response.status()).toBe(401);
    expect(response.body().message).toBe('Missing Authentication token.');
  });

  test('it can logout authenticated user', async ({ client, expect }) => {
    const response = await client.delete('/api/auth/logout').bearerToken(token);

    expect(response.status()).toBe(200);
    expect(response.body().status).toBeTruthy();
  });
});
