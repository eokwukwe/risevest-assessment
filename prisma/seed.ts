import { faker } from '@faker-js/faker';
import { Post } from '@prisma/client';

import { Logger, prisma } from '../src/utils';
import { PostService, UserService, UserWithoutPassword } from '../src/services';

function getRandomInt(min: number = 0, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSubset<T>(array: T[], size: number): T[] {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

async function main() {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  Logger.info('seeding data.....');

  let users: UserWithoutPassword[];
  let posts: Post[] = [];

  users = await UserService.createMany(
    Array.from({ length: 50 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password',
    }))
  );

  for (const user of users) {
    const postData = Array.from({ length: getRandomInt(1, 200) }, () => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(5),
      userId: user.id,
    }));

    posts = await PostService.createMany(postData);
  }

  for (const post of posts) {
    const commenters = getRandomSubset(users, getRandomInt(1, users.length));

    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: commenter.id,
          content: faker.word.words(10),
        },
      });
    }
  }
}

main()
  .then(async () => {
    Logger.info('Database seeded successfully....');
  })
  .catch(async (e) => {
    Logger.error(`Error seeding database: ${(e as any).message}`);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
