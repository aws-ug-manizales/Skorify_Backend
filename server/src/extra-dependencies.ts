import { RunIracaConfig } from "@scifamek-open-source/iraca/web-api";
import { MatchContract } from "@skorify/domain/match";
import {
  PredictionContract
} from "@skorify/domain/prediction";
import { TeamContract } from "@skorify/domain/team";
import { TournamentContract } from "@skorify/domain/tournament";
import { TournamentInstanceContract } from "@skorify/domain/tournament-instance";
import { UserContract } from "@skorify/domain/user";
import { UserEnrollmentContract } from "@skorify/domain/user-enrollment";
import {
  MatchRepository,
  PredictionRepository,
  TeamRepository,
  TournamentInstanceRepository,
  TournamentRepository,
  UserRepository,
  UserEnrollmentRepository
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
  {
    abstraction: UserEnrollmentContract,
    implementation: UserEnrollmentRepository,
    dependencies: ["UserEnrollmentDatasource"],
  },
];
