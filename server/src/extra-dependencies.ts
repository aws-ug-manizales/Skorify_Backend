import { RunIracaConfig } from '@scifamek-open-source/iraca/web-api';
import { MatchContract } from '@skorify/domain/match';
import { EditPredictionUsecase, PredictionContract } from '@skorify/domain/prediction';
import { TeamContract } from '@skorify/domain/team';
import { TournamentContract } from '@skorify/domain/tournament';
import { TournamentInstanceContract } from '@skorify/domain/tournament-instance';
import { UserContract } from '@skorify/domain/user';
import { UserEnrollmentContract } from '@skorify/domain/user-enrollment';
import {
  MatchRepository,
  PredictionRepository,
  TeamRepository,
  TournamentInstanceRepository,
  TournamentRepository,
  UserEnrollmentRepository,
  UserRepository,
} from '@skorify/shared';
import { MatchMapper } from '@skorify/shared/mappers/match.mapper';
import { PredictionMapper } from '@skorify/shared/mappers/prediction.mapper';
import { TeamMapper } from '@skorify/shared/mappers/team.mapper';
import { TournamentInstanceMapper } from '@skorify/shared/mappers/tournament-instance.mapper';
import { TournamentMapper } from '@skorify/shared/mappers/tournament.mapper';
import { UserEnrollmentMapper } from '@skorify/shared/mappers/user-enrollment.mappert';
import { UserMapper } from '@skorify/shared/mappers/user.mapper';
import { EditPredictionUsecaseImpl } from './features/prediction/usecases/edit-prediction.usecase-impl';

export const extraDependencies: RunIracaConfig['extraDependencies'] = [
  {
    abstraction: EditPredictionUsecase,
    implementation: EditPredictionUsecaseImpl,
    dependencies: [
      'GetPredictionByIdUsecase',
      'GetMatchByIdUsecase',
      'PredictionContract',
      'predictionEditingWindow',
    ],
  },
  // Repositories
  {
    component: MatchMapper,
  },
  {
    abstraction: MatchContract,
    implementation: MatchRepository,
    dependencies: ['MatchDatasource', 'MatchMapper'],
  },
  {
    component: UserMapper,
  },
  {
    abstraction: UserContract,
    implementation: UserRepository,
    dependencies: ['UserDatasource', 'UserMapper'],
  },
  {
    component: PredictionMapper,
  },
  {
    abstraction: PredictionContract,
    implementation: PredictionRepository,
    dependencies: ['PredictionDatasource', 'PredictionMapper'],
  },

  {
    component: TournamentMapper,
  },
  {
    abstraction: TournamentContract,
    implementation: TournamentRepository,
    dependencies: ['TournamentDatasource', 'TournamentMapper'],
  },
  {
    component: TournamentInstanceMapper,
  },
  {
    abstraction: TournamentInstanceContract,
    implementation: TournamentInstanceRepository,
    dependencies: ['TournamentInstanceDatasource', 'TournamentInstanceMapper'],
  },
  {
    component: TeamMapper,
  },
  {
    abstraction: TeamContract,
    implementation: TeamRepository,
    dependencies: ['TeamDatasource', 'TeamMapper'],
  },
  {
    component: UserEnrollmentMapper,
  },
  {
    abstraction: UserEnrollmentContract,
    implementation: UserEnrollmentRepository,
    dependencies: ['UserEnrollmentDatasource', 'UserEnrollmentMapper'],
  },
];
