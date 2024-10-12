import { test } from '@japa/runner';

test('Home Route', async ({ client, expect }) => {
  const response = await client.get('/api/check');

  expect(response.status()).toBe(200);
  expect(response.body()).toEqual({
    status: true,
    message: "Welcome to RISEVEST API",
  });
});
