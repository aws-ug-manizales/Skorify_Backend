import { RunIracaConfig } from "@scifamek-open-source/iraca/web-api";
import { MatchContract } from "@skorify/domain/match";
import {
  JsonDataSource,
  MatchRepository,
  UserRepository,
  PredictionRepository,
} from "@skorify/shared";
import { UserContract, UserEntity } from "@skorify/domain/user";
import { PredictionContract } from "@skorify/domain/prediction";

export const extraDependencies: RunIracaConfig["extraDependencies"] = [
  {
    id: "MatchDatasource",
    value: new JsonDataSource<UserEntity>("matches.json"),
  },
  {
    id: "UserDatasource",
    value: new JsonDataSource<UserEntity>("users.json"),
  },
  {
    id: "PredictionDatasource",
    value: new JsonDataSource<UserEntity>("predictions.json"),
  },
  {
    abstraction: MatchContract,
    implementation: MatchRepository,
    dependencies: ["MatchDatasource"],
  },
  {
    abstraction: UserContract,
    implementation: UserRepository,
    dependencies: ["UserDatasource"],
  },
  {
    abstraction: PredictionContract,
    implementation: PredictionRepository,
    dependencies: ["PredictionDatasource"],
  },
];
