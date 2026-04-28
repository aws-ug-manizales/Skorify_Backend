import { RunIracaConfig } from "@scifamek-open-source/iraca/web-api";
import { MatchContract } from "@skorify/domain/match";
import {
  PredictionContract,
  PredictionEntity,
} from "@skorify/domain/prediction";
import {
  TournamentContract,
  TournamentEntity,
} from "@skorify/domain/tournament";
import { TournamentInstanceContract } from "@skorify/domain/tournament-instance";
import { UserContract, UserEntity } from "@skorify/domain/user";
import {
  JsonDataSource,
  MatchRepository,
  PostgresMatchDataSource,
  PredictionRepository,
  TournamentInstanceRepository,
  TournamentRepository,
  UserRepository,
} from "@skorify/shared";

export const extraDependencies: RunIracaConfig["extraDependencies"] = [
  {
    id: "UserDatasource",
    value: new JsonDataSource<UserEntity>("users.json"),
  },
  {
    id: "PredictionDatasource",
    value: new JsonDataSource<PredictionEntity>("predictions.json"),
  },
  {
    id: "TournamentDatasource",
    value: new JsonDataSource<TournamentEntity>("tournaments.json"),
  },
  {
    id: "TournamentInstanceDatasource",
    value: new JsonDataSource<TournamentEntity>("tournament-intances.json"),
  },

  // Repositories
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
  {
    abstraction: TournamentContract,
    implementation: TournamentRepository,
    dependencies: ["TournamentDatasource"],
  },
  {
    abstraction: TournamentInstanceContract,
    implementation: TournamentInstanceRepository,
    dependencies: ["TournamentInstanceDatasource"],
  },
];
