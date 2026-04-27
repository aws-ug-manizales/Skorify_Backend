import "dotenv/config";
import { runIraca } from "@scifamek-open-source/iraca/web-api";
import { Logger } from "@scifamek-open-source/logger";
import { join } from "node:path";
import { middleware } from "./middleware";
import { extraDependencies } from "./extra-dependencies";
import { dbClient } from "./config/database.config";

async function main() {
  const loggerFolder = "logs";
  const initServerLogger = new Logger(join(loggerFolder, "init-server.log"));
  const runtimeLogger = new Logger(join(loggerFolder, "runtime.log"));

  // Connect to database
  try {
    await dbClient.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }

  await runIraca({
    dirname: __dirname,
    extraDependencies,
    enabledHandler: middleware,
    port: 9898,
    initServerLogger,

    loggerConfiguration: {
      logger: runtimeLogger,
    },
  });

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    await dbClient.disconnect();
    process.exit(0);
  });
}

main();
