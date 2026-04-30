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
import { TeamContract } from "@skorify/domain/team";
import { UserContract, UserEntity } from "@skorify/domain/user";
import {
  JsonDataSource,
  MatchRepository,
  PredictionRepository,
  TournamentInstanceRepository,
  TournamentRepository,
  UserRepository,
  TeamRepository,
} from "@skorify/shared";

export const extraDependencies: RunIracaConfig["extraDependencies"] = [
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
  {
    abstraction: TeamContract,
    implementation: TeamRepository,
    dependencies: ["TeamDatasource"],
  },
];
