import config from 'config';
import { createClient } from 'redis';
import { Logger } from './logger';

const redisURL = config.get<string>('redisURL');

export const redisClient = createClient({
  url: redisURL,
  socket: {
    connectTimeout: 10000,
  },
});

const connectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      Logger.info('Redis client already connected.');
      return;
    }

    await redisClient.connect();

    Logger.info('Redis client connected successfully');

    redisClient.set('check', 'Welcome to RISEVEST API');
  } catch (error) {
    Logger.error('An error occurred while connecting to Redis:', error);

    setTimeout(connectRedis, 5000);
  }
};

if (!redisClient.isOpen) {
  connectRedis();
}
