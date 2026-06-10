import { join } from 'node:path';
import { exit } from 'node:process';
import { BuilderConfiguration } from './general/builder';
import { logger, serializeError } from './general/logger';
import { BuilderNamesMapper, ValidBuilderNames } from './general/models';
import { ModuleLambdaAWSBuilder } from './impl/module-lambda-aws';
import { SingleLambdaAWSBuilder } from './impl/single-lambda-aws';

async function main() {
  const args = process.argv;
  const validWays: ValidBuilderNames[] = ['single-lambda-aws', 'module-lambda-aws'];

  const way = args[2];
  const env = args[3] ?? 'dev';
  if (!validWays.includes(way as ValidBuilderNames)) {
    exit(1);
  }

  const root = join(__dirname, '..');
  const config: BuilderConfiguration = {
    root,
    serverFolder: join(root, '..', 'server'),
  };
  const builders: Partial<BuilderNamesMapper> = {
    'single-lambda-aws': new SingleLambdaAWSBuilder(),
    'module-lambda-aws': new ModuleLambdaAWSBuilder(),
  };
  const builder = builders[way as ValidBuilderNames];
  try {
    await builder?.build(config, env);
  } catch (e) {
    logger.error('Builder failed', {
      builder: way,
      environment: env,
      error: serializeError(e),
    });
    exit(1);
  }
}
main();
