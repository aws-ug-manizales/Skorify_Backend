import { runIraca } from '@scifamek-open-source/iraca/web-api';
import { Logger } from '@scifamek-open-source/logger';
import { join } from 'node:path';
import { onLoadIraca } from './config/on-load-iraca';
import { DBClient } from '@skorify/data';
import { GetUserByIdUsecaseImpl } from './features/user/usecases/get-user-by-id.usecase-impl';
import { GetUserByIdUsecase, UserContract } from '@skorify/domain/user';
import { UserRepository } from '@skorify/shared';
import { extraDependencies } from './extra-dependencies';
import { middleware } from './middleware';

async function main() {
  const loggerFolder = 'logs';
  const initServerLogger = new Logger(join(loggerFolder, 'init-server.log'));
  const runtimeLogger = new Logger(join(loggerFolder, 'runtime.log'));

  const { server, container } = await runIraca({
    dirname: __dirname,
    extraDependencies,
    enabledHandler: middleware,
    onLoadIraca,
    port: 9898,
    initServerLogger,

    loggerConfiguration: {
      logger: runtimeLogger,
    },
  });

  server.cors({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Disposition',
  });
  // Graceful shutdown
  // process.on("SIGTERM", async () => {
  //   const dbClient = await container.getInstance<DBClient>("DBClient");
  //   await dbClient.disconnect();
  //   process.exit(0);
  // });
}

main();
