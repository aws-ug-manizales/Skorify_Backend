import { exit } from 'node:process';
import { BuilderNamesMapper, ValidBuilderNames } from './general/models';
import { SingleLambdaAWSBuilder } from './impl/single-lambda-aws';
import { BuilderConfiguration } from './general/builder';
import { join } from 'node:path';
import { ModuleLambdaAWSBuilder } from './impl/module-lambda-aws';

async function main() {
  const args = process.argv;
  const validWays: ValidBuilderNames[] = ['single-lambda-aws', 'module-lambda-aws'];

  const way = args[2];
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
    await builder?.build(config);
  } catch (e) {
    console.error(e);
    exit(1);
  }
}
main();
