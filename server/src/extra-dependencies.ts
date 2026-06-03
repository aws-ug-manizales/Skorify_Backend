import { RunIracaConfig } from '@scifamek-open-source/iraca/web-api';
import { MatchContract } from '@skorify/domain/match';
import { PredictionContract } from '@skorify/domain/prediction';
import { TeamContract } from '@skorify/domain/team';
import { TournamentContract } from '@skorify/domain/tournament';
import { TournamentInstanceContract } from '@skorify/domain/tournament-instance';
import { IdentityProviderContract, UserContract } from '@skorify/domain/user';
import { UserEnrollmentContract } from '@skorify/domain/user-enrollment';
import {
  IdentityProviderMemoryImpl,
  MatchRepository,
  PredictionRepository,
  TeamRepository,
  TournamentInstanceRepository,
  TournamentRepository,
  UserEnrollmentRepository,
  UserRepository,
} from '@skorify/shared';
import { MatchMapper } from '@skorify/shared';
import { PredictionMapper } from '@skorify/shared';
import { TeamMapper } from '@skorify/shared';
import { TournamentInstanceMapper } from '@skorify/shared';
import { TournamentMapper } from '@skorify/shared';
import { UserEnrollmentMapper } from '@skorify/shared';
import { UserMapper } from '@skorify/shared';

export const extraDependencies: RunIracaConfig['extraDependencies'] = [
  // Repositories
  // {
  //   component: MatchMapper,
  // },
  // {
  //   abstraction: MatchContract,
  //   implementation: MatchRepository,
  //   dependencies: ['MatchDatasource', 'MatchMapper'],
  // },
  // {
  //   component: UserMapper,
  // },
  // {
  //   abstraction: UserContract,
  //   implementation: UserRepository,
  //   dependencies: ['UserDatasource', 'UserMapper'],
  // },
  {
    abstraction: IdentityProviderContract,
    implementation: IdentityProviderMemoryImpl,
  },
  // {
  //   component: PredictionMapper,
  // },
  // {
  //   abstraction: PredictionContract,
  //   implementation: PredictionRepository,
  //   dependencies: ['PredictionDatasource', 'PredictionMapper'],
  // },

  // {
  //   component: TournamentMapper,
  // },
  // {
  //   abstraction: TournamentContract,
  //   implementation: TournamentRepository,
  //   dependencies: ['TournamentDatasource', 'TournamentMapper'],
  // },
  // {
  //   component: TournamentInstanceMapper,
  // },
  // {
  //   abstraction: TournamentInstanceContract,
  //   implementation: TournamentInstanceRepository,
  //   dependencies: ['TournamentInstanceDatasource', 'TournamentInstanceMapper'],
  // },
  // {
  //   component: TeamMapper,
  // },
  // {
  //   abstraction: TeamContract,
  //   implementation: TeamRepository,
  //   dependencies: ['TeamDatasource', 'TeamMapper'],
  // },
  // {
  //   component: UserEnrollmentMapper,
  // },
  // {
  //   abstraction: UserEnrollmentContract,
  //   implementation: UserEnrollmentRepository,
  //   dependencies: ['UserEnrollmentDatasource', 'UserEnrollmentMapper'],
  // },
];
