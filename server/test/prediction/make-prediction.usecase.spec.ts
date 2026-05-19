import { DomainEvent, type Id } from '@skorify/domain/core';
import {
  GottenMatchDomainEvent,
  MatchDoesNotExistDomainEvent,
  type GetMatchByIdUsecase,
} from '@skorify/domain/match';
import { MatchEntity } from '@skorify/domain/match/match.entity';
import { MatchStatus } from '@skorify/domain/match/match.state';
import { PredictionCreatedDomainEvent, PredictionNotCreatedDomainEvent, type MakePredictionParam, type PredictionContract } from '@skorify/domain/prediction';
import { PredictionEntity } from '@skorify/domain/prediction/prediction.entity';
import { GottenUserDomainEvent, type GetUserByIdUsecase } from '@skorify/domain/user';
import { UserEntity } from '@skorify/domain/user/user.entity';
import { MakePredictionUsecaseImpl } from '../../src/features/prediction/usecases/make-prediction.usecase-impl';
import {
  UserEnrollmentEntity,
  UserIsInTournamentInstanceDomainEvent,
  UserIsNotInTournamentInstanceDomainEvent,
} from '@skorify/domain/user-enrollment';

describe('MakePredictionUsecaseImpl', () => {
  const userId = '11111111-1111-1111-1111-111111111111' as Id;
  const matchId = '22222222-2222-2222-2222-222222222222' as Id;
  const tournamentInstanceId = '33333333-3333-3333-3333-333333333333' as Id;
  const awayTeamId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as Id;
  const homeTeamId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as Id;
  const tournamentId = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as Id;
  const userEnrollmentId = 'cccccccc-dddd-cccc-cccc-cccccccccccc' as Id;

  type MockGetUserById = Pick<GetUserByIdUsecase, 'call'>;
  type MockGetMatchById = Pick<GetMatchByIdUsecase, 'call'>;
  type MockPredictionContract = Pick<PredictionContract, 'filter' | 'save'> &
    Partial<PredictionContract>;

  const defaultParam: MakePredictionParam = {
    userId,
    tournamentInstanceId,
    matchId,
    awayScore: 1,
    homeScore: 0,
  };

  function makeUser(active = true) {
    return UserEntity.build({
      id: userId,
      name: 'u',
      isActive: active,
      notificationToken: '',
      email: 'u@test.com',
      createdAt: new Date(),
    });
  }
  function makeUserEnrollment(active = true) {
    return UserEnrollmentEntity.build({
      id: userId,
      currentPosition: 0,
      currentScore: 0,
      joinedAt: new Date(),
      lastPosition: 41,
      maxStreak: 4,
      streak: 0,
      tournamentId: tournamentId,
      tournamentInstanceId: tournamentId,
      userId: userId,
    });
  }

  function makeMatch(status = MatchStatus.Scheduled, kickOff?: Date): DomainEvent {
    return MatchEntity.build({
      id: matchId,
      awayTeamId,
      homeTeamId,
      tournamentId,
      kickOff: kickOff ?? new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
      status,
    });
  }

  it('returns user not active when user is inactive', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(false).payload)),
    };
    const getMatchByIdUsecase: MockGetMatchById = { call: jest.fn() };
    const predictionContract: MockPredictionContract = {
      save: jest.fn(),
      filter: jest.fn(),
    };
    const isAUserInTournamentInstanceUsecase: MockGetUserById = {
      call: jest
        .fn()
        .mockResolvedValue(UserIsInTournamentInstanceDomainEvent(makeUserEnrollment().payload)),
    };
    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
      isAUserInTournamentInstanceUsecase,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('UserNotActiveDomainEvent');
  });

  it('returns match not found when match does not exist', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true).payload)),
    };
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(MatchDoesNotExistDomainEvent()),
    };
    const predictionContract: MockPredictionContract = {
      save: jest.fn(),
      filter: jest.fn(),
    };
    const isAUserInTournamentInstanceUsecase: MockGetUserById = {
      call: jest
        .fn()
        .mockResolvedValue(UserIsInTournamentInstanceDomainEvent(makeUserEnrollment().payload)),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
      isAUserInTournamentInstanceUsecase,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('MatchDoesNotExistDomainEvent');
  });

  it('returns MatchCannotBeBetedDomainEvent when match cannot be bet', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true).payload)),
    };
    const match = makeMatch(MatchStatus.InProgress);
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match.payload)),
    };
    const predictionContract: MockPredictionContract = {
      save: jest.fn(),
      filter: jest.fn(),
    };

    const isAUserInTournamentInstanceUsecase: MockGetUserById = {
      call: jest
        .fn()
        .mockResolvedValue(UserIsInTournamentInstanceDomainEvent(makeUserEnrollment().payload)),
    };
    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
      isAUserInTournamentInstanceUsecase,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('MatchCannotBeBetedDomainEvent');
  });

  it('creates prediction successfully', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true).payload)),
    };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match.payload)),
    };
    const predictionContract: MockPredictionContract = {
      save: jest.fn().mockImplementation(async (p: PredictionEntity) => p),
      filter: jest.fn().mockResolvedValue([]),
    };

    const isAUserInTournamentInstanceUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(UserIsInTournamentInstanceDomainEvent(makeUserEnrollment().payload)),
    };
    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
      isAUserInTournamentInstanceUsecase,
    );

    const res = await uc.call({ ...defaultParam, awayScore: 2, homeScore: 1 });

    expect(res.eventName).toBe(PredictionCreatedDomainEvent.eventName);
  });

  it('returns PredictionNotCreatedDomainEvent when save fails', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true).payload)),
    };
    const isAUserInTournamentInstanceUsecase: MockGetUserById = {
      call: jest
        .fn()
        .mockResolvedValue(UserIsInTournamentInstanceDomainEvent(makeUserEnrollment().payload)),
    };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match.payload)),
    };
    const predictionContract: MockPredictionContract = {
      save: jest.fn().mockResolvedValue(null),
      filter: jest.fn().mockResolvedValue([]),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
      isAUserInTournamentInstanceUsecase,
    );

    const res = await uc.call({ ...defaultParam, awayScore: 2, homeScore: 1 });

    expect(res.eventName).toBe(PredictionNotCreatedDomainEvent.eventName);
  });
});
