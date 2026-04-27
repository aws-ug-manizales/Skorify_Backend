import { RunIracaConfig } from "@scifamek-open-source/iraca/web-api";
import { MatchContract, MatchEntity } from "@skorify/domain/match";
import {
  JsonDataSource,
  PostgresMatchDataSource,
  MatchRepository,
  UserRepository,
  PredictionRepository,
  TournamentRepository,
  TournamentInstanceRepository,
} from "@skorify/shared";
import { UserContract, UserEntity } from "@skorify/domain/user";
import {
  PredictionContract,
  PredictionEntity,
} from "@skorify/domain/prediction";
import {
  TournamentContract,
  TournamentEntity,
} from "@skorify/domain/tournament";
import {
  TournamentInstanceContract,
  TournamentInstanceEntity,
} from "@skorify/domain/tournament-instance";
import { dbClient } from "./config/database.config";

export const extraDependencies: RunIracaConfig["extraDependencies"] = [
  // DBClient instance for direct database access
  {
    id: "DBClient",
    value: dbClient,
  },

  // DataSources
  {
    id: "MatchDatasource",
    value: new PostgresMatchDataSource(dbClient),
  },
  // Keeping JSON for entities not yet migrated to PostgreSQL
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
