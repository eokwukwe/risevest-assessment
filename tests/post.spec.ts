import { test } from '@japa/runner';
import { Post } from '@prisma/client';
import { faker } from '@faker-js/faker';

import {
  PostService,
  SessionService,
  UserService,
  UserWithoutPassword,
} from '../src/services';
import { prisma } from '../src/utils';

test.group('Post Resource', (group) => {
  let token: string;
  let user: UserWithoutPassword;
  let posts: Post[];

  group.setup(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    user = await UserService.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    token = await SessionService.create(user);
  });

  group.teardown(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    if (token) {
      await SessionService.delete(token);
    }
  });

  test('it checks user exits before fetching posts', async ({
    client,
    expect,
  }) => {
    const users = await prisma.user.findMany();

    const response = await client
      .get(`/api/users/${users.length + 1}/posts`)
      .bearerToken(token);

    expect(response.status()).toBe(404);
  });

  test('it can fetch user posts', async ({ client, expect }) => {
    const response = await client
      .get(`/api/users/${user.id}/posts`)
      .bearerToken(token);

    expect(response.status()).toBe(200);
    expect(response.body().data.posts).toHaveLength(posts.length);
  })
    .setup(async () => {
      const data = Array.from({ length: 10 }, () => ({
        title: faker.word.words(3),
        content: faker.word.words(100),
        userId: user.id,
      }));

      posts = await prisma.post.createManyAndReturn({ data });
    })
    .teardown(async () => await prisma.post.deleteMany());

  test('it validates required fields when creating post', async ({
    client,
    expect,
  }) => {
    const response = await client
      .post(`/api/users/${user.id}/posts`)
      .bearerToken(token)
      .json({});

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      title: 'Title is required.',
      content: 'Content is required.',
    });
  });

  test('it validates input field types', async ({ client, expect }) => {
    const response = await client
      .post(`/api/users/${user.id}/posts`)
      .bearerToken(token)
      .json({
        title: 123,
        content: 123,
      });

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      title: 'Title must be string.',
      content: 'Content must be string.',
    });
  });

  test('it validates title and content min length', async ({
    client,
    expect,
  }) => {
    const response = await client
      .post(`/api/users/${user.id}/posts`)
      .bearerToken(token)
      .json({ title: '', content: '' });

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      title: 'Title cannot be empty.',
      content: 'Content cannot be empty.',
    });
  });

  test('it successfully creates a user post', async ({ client, expect }) => {
    const data = { title: faker.word.words(3), content: faker.word.words(200) };

    const response = await client
      .post(`/api/users/${user.id}/posts`)
      .bearerToken(token)
      .json(data);

    expect(response.status()).toBe(201);
    expect(response.body().status).toBeTruthy();
    expect(response.body().data.title).toBe(data.title);
    expect(response.body().data.userId).toBe(user.id);
  });

  test('it can add a comment to a post', async ({ client, expect }) => {
    const comment = 'this is a comment of all comments';
    const data = { title: faker.word.words(3), content: faker.word.words(200) };
    const post = await PostService.create(data, user.id);

    const response = await client
      .post(`/api/posts/${post.id}/comments`)
      .bearerToken(token)
      .json({ content: comment });

    expect(response.status()).toBe(201);
    expect(response.body().status).toBeTruthy();
    expect(response.body().data.content).toBe(comment);
    expect(response.body().data.postId).toBe(post.id);
  });

  test('it validates required field when adding comment', async ({
    client,
    expect,
  }) => {
    const data = { title: faker.word.words(3), content: faker.word.words(200) };
    const post = await PostService.create(data, user.id);

    const response = await client
      .post(`/api/posts/${post.id}/comments`)
      .bearerToken(token)
      .json({});

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      content: 'Content is required.',
    });
  });

  test('it validates empty content when adding comment', async ({
    client,
    expect,
  }) => {
    const data = { title: faker.word.words(3), content: faker.word.words(200) };
    const post = await PostService.create(data, user.id);

    const response = await client
      .post(`/api/posts/${post.id}/comments`)
      .bearerToken(token)
      .json({ content: '' });

    expect(response.status()).toBe(422);
    expect(response.body().error).toMatchObject({
      content: 'Comment cannot be empty.',
    });
  });

  test('it ensures post exists when adding comment', async ({
    client,
    expect,
  }) => {
    const p = await prisma.post.findMany();

    const response = await client
      .post(`/api/posts/${p.length + 1}/comments`)
      .bearerToken(token)
      .json({ content: 'a comment' });

    expect(response.status()).toBe(404);
    expect(response.body().message).toBe('Post not found.');
  });
});
