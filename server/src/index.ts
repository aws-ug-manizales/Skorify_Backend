import { UserContract } from "@skorify/domain/user";
import { MakeBetUsecaseImpl } from "./features/bet/usecases/make-bet.usecase-impl";
import { GetUserByIdUsecaseImpl } from "./features/user/usecases/get-user-by-id.usecase-impl";
import { UserAWSRepository } from "./features/user/infrastructure/user.aws-repository";
import { runIraca } from "@scifamek-open-source/iraca/web-api";
import { Logger } from "@scifamek-open-source/logger";
import { join } from "node:path";

// const userContract = new UserAWSRepository();

// const getUserByIdUsecase = new GetUserByIdUsecaseImpl(userContract);
// const makeBetUsecaseImpl = new MakeBetUsecaseImpl(getUserByIdUsecase);
async function main() {
  const loggerFolder = "logs";
  const initServerLogger = new Logger(join(loggerFolder, "init-server.log"));
  const runtimeLogger = new Logger(join(loggerFolder, "runtime.log"));

  const { container, controllers, server } = await runIraca({
    dirname: __dirname,
    port: 9898,
    initServerLogger,
    loggerConfiguration: {
      logger: runtimeLogger,
    },
  });
}

main();
