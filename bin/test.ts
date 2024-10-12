import config from 'config';
import { expect } from '@japa/expect';
import { apiClient } from '@japa/api-client';
import { specReporter } from '@japa/spec-reporter';
import { runFailedTests } from '@japa/run-failed-tests';
import { processCliArgs, configure, run } from '@japa/runner';

import { createApp } from '../src/app';
import { prisma } from '../src/utils';

const port = config.get<number>('port');

// Start the server
createApp(port);

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.spec.ts'],
    plugins: [
      expect(),
      runFailedTests(),
      apiClient(`http://localhost:${port}`),
    ],
    reporters: [specReporter()],
    importer: (filePath) => import(filePath),
    forceExit: true,
    teardown: [async () => await prisma.$disconnect()],
  },
});

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run();
