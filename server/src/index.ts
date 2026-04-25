import { runIraca } from "@scifamek-open-source/iraca/web-api";
import { Logger } from "@scifamek-open-source/logger";
import { join } from "node:path";
import { middleware } from "./middleware";
import { extraDependencies } from "./extra-dependencies";

async function main() {
  const loggerFolder = "logs";
  const initServerLogger = new Logger(join(loggerFolder, "init-server.log"));
  const runtimeLogger = new Logger(join(loggerFolder, "runtime.log"));

  const { container, controllers, server } = await runIraca({
    dirname: __dirname,
    extraDependencies,
    enabledHandler: middleware,
    port: 9898,
    initServerLogger,

    loggerConfiguration: {
      logger: runtimeLogger,
    },
  });
}

main();
