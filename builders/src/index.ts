import { exit } from "node:process";
import { BuilderNamesMapper, ValidBuilderNames } from "./general/models";
import { LambdaAWSBuilder } from "./lambda-aws";
import { BuilderConfiguration } from "./general/builder";
import { join } from "node:path";

async function main() {
  const args = process.argv;
  const validWays = ["lambda"];

  const way = args[2];
  if (!validWays.includes(way)) {
    exit(1);
  }

  const root = join(__dirname, "..");
  const config: BuilderConfiguration = {
    root,
    serverFolder: join(root, "..", "server"),
  };
  const builders: BuilderNamesMapper = {
    lambda: new LambdaAWSBuilder(),
  };
  const builder = builders[way as ValidBuilderNames];
  await builder.build(config);
}
main();
