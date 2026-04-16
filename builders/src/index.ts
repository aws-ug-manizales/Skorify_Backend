import { exit } from "node:process";
import { BuilderNamesMapper, ValidBuilderNames } from "./general/models";
import { SingleLambdaAWSBuilder } from "./single-lambda-aws";
import { BuilderConfiguration } from "./general/builder";
import { join } from "node:path";

async function main() {
  const args = process.argv;
  const validWays: ValidBuilderNames[] = ["single-lambda-aws"];

  const way = args[2];
  if (!validWays.includes(way as ValidBuilderNames)) {
    exit(1);
  }

  const root = join(__dirname, "..");
  const config: BuilderConfiguration = {
    root,
    serverFolder: join(root, "..", "server"),
  };
  const builders: Partial<BuilderNamesMapper> = {
    "single-lambda-aws": new SingleLambdaAWSBuilder(),
  };
  const builder = builders[way as ValidBuilderNames];
  await builder?.build(config);
}
main();
