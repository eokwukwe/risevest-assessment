import dotenv from 'dotenv';

dotenv.config();

import config from 'config';

import { createApp } from './app';

const port = config.get<number>('port');

createApp(port);
