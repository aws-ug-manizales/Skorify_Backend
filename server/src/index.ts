import { runIraca } from "@scifamek-open-source/iraca/web-api";
import { Logger } from "@scifamek-open-source/logger";
import { join } from "node:path";
import { onLoadIraca } from "./config/on-load-iraca";
import { extraDependencies } from "./extra-dependencies";
import { middleware } from "./middleware";

async function main() {
  const loggerFolder = "logs";
  const initServerLogger = new Logger(join(loggerFolder, "init-server.log"));
  const runtimeLogger = new Logger(join(loggerFolder, "runtime.log"));

  const { container } = await runIraca({
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

  // Graceful shutdown
  // process.on("SIGTERM", async () => {
  //   const dbClient = await container.getInstance<DBClient>("DBClient");
  //   await dbClient.disconnect();
  //   process.exit(0);
  // });
}

main();
