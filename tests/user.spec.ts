import { test } from '@japa/runner';
import { prisma } from '../src/utils';
import { faker } from '@faker-js/faker';
import {
  SessionService,
  UserService,
  UserWithoutPassword,
} from '../src/services';

test.group('User Resource', (group) => {
  let token: string;
  let user: UserWithoutPassword;
  let users: UserWithoutPassword[];

  group.setup(async () => {
    const data = Array.from({ length: 5 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password',
    }));

    users = await UserService.createMany(data);
  });

  group.teardown(async () => {
    await prisma.user.deleteMany();
  });

  test('it cannot fetch all users when not authenticated', async ({
    client,
    expect,
  }) => {
    const response = await client.get('/api/users');

    expect(response.status()).toBe(401);
    expect(response.body().status).toBeFalsy();
  });

  test('it can fetch all users', async ({ client, expect }) => {
    const response = await client.get('/api/users').bearerToken(token);

    expect(response.status()).toBe(200);
    expect(response.body().data.users).toHaveLength(users.length + 1);
  })
    .setup(async () => {
      user = await UserService.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

      token = await SessionService.create({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    })
    .teardown(async () => {
      if (token) {
        await SessionService.delete(token);
      }
    });

  test('it validates required fields when creating user', async ({
    client,
    expect,
  }) => {
    const response = await client.post('/api/users').json({});

    expect(response.status()).toBe(422);
    expect(response.body()).toMatchObject({
      status: false,
      message: 'Validation Error.',
      error: {
        name: 'Name is required.',
        email: 'Email is required.',
        password: 'Password is required.',
      },
    });
  });

  test('it validates field types when creating user', async ({
    client,
    expect,
  }) => {
    const response = await client.post('/api/users').json({
      name: 123,
      email: 'mail.com',
      password: 123232333,
    });

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      name: 'Name must be a string.',
      email: 'Invalid email address.',
      password: 'Password must be a string.',
    });
  });

  test('it validates password length when creating user', async ({
    client,
    expect,
  }) => {
    const response = await client.post('/api/users').json({
      name: 'John Doe',
      email: 'john@mail.com',
      password: 'pass',
    });

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      password: 'Password must be more than 8 characters.',
    });
  });

  test('it validates duplicate email when creating user', async ({
    client,
    expect,
  }) => {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password',
    };

    await UserService.create(user);

    const response = await client.post('/api/users').json(user);

    expect(response.status()).toBe(422);
    expect(response.body().error.email).toBe('Email already exists.');
  });

  test('it successfully creates a user', async ({ client, expect }) => {
    const data = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password(),
    };

    const response = await client.post('/api/users').json(data);

    expect(response.status()).toBe(201);
    expect(response.body().status).toBeTruthy();
    expect(response.body().data.email).toBe(data.email);
  });
});
