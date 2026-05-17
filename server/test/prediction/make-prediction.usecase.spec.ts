import type { Id } from '@skorify/domain/core';
import {
  GottenMatchDomainEvent,
  MatchDoesNotExistDomainEvent,
  type GetMatchByIdUsecase,
} from '@skorify/domain/match';
import { MatchEntity } from '@skorify/domain/match/match.entity';
import { MatchStatus } from '@skorify/domain/match/match.state';
import type { MakePredictionParam, PredictionContract } from '@skorify/domain/prediction';
import { PredictionEntity } from '@skorify/domain/prediction/prediction.entity';
import { GottenUserDomainEvent, type GetUserByIdUsecase } from '@skorify/domain/user';
import { UserEntity } from '@skorify/domain/user/user.entity';
import { MakePredictionUsecaseImpl } from '../../src/features/prediction/usecases/make-prediction.usecase-impl';

describe('MakePredictionUsecaseImpl', () => {
  const userId = '11111111-1111-1111-1111-111111111111' as Id;
  const matchId = '22222222-2222-2222-2222-222222222222' as Id;
  const instanceId = '33333333-3333-3333-3333-333333333333' as Id;
  const awayTeamId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as Id;
  const homeTeamId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as Id;
  const tournamentId = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as Id;

  type MockGetUserById = Pick<GetUserByIdUsecase, 'call'>;
  type MockGetMatchById = Pick<GetMatchByIdUsecase, 'call'>;
  type MockPredictionContract = Pick<PredictionContract, 'getByUserAndMatch' | 'save'> &
    Partial<PredictionContract>;

  const defaultParam: MakePredictionParam = {
    userId,
    instanceId,
    matchId,
    awayTeamScore: 1,
    localTeamScore: 0,
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

  function makeMatch(status = MatchStatus.Scheduled, kickOff?: Date) {
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
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(false))),
    };
    const getMatchByIdUsecase: MockGetMatchById = { call: jest.fn() };
    const predictionContract: MockPredictionContract = {
      getByUserAndMatch: jest.fn(),
      save: jest.fn(),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('UserNotActiveDomainEvent');
  });

  it('returns match not found when match does not exist', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))),
    };
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(MatchDoesNotExistDomainEvent()),
    };
    const predictionContract: MockPredictionContract = {
      getByUserAndMatch: jest.fn(),
      save: jest.fn(),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('MatchDoesNotExistDomainEvent');
  });

  it('returns MatchCannotBeBetedDomainEvent when match cannot be bet', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))),
    };
    const match = makeMatch(MatchStatus.InProgress);
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)),
    };
    const predictionContract: MockPredictionContract = {
      getByUserAndMatch: jest.fn(),
      save: jest.fn(),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
    );

    const res = await uc.call(defaultParam);

    expect(res.eventName).toBe('MatchCannotBeBetedDomainEvent');
  });

  it('creates prediction successfully', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))),
    };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)),
    };
    const predictionContract: MockPredictionContract = {
      getByUserAndMatch: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(async (p: PredictionEntity) => p),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
    );

    const res = await uc.call({ ...defaultParam, awayTeamScore: 2, localTeamScore: 1 });

    expect(res.eventName).toBe('PredictionCreatedDomainEvent');
  });

  it('returns PredictionNotCreatedDomainEvent when save fails', async () => {
    const getUserByIdUsecase: MockGetUserById = {
      call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))),
    };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: MockGetMatchById = {
      call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)),
    };
    const predictionContract: MockPredictionContract = {
      getByUserAndMatch: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(null),
    };

    const uc = new MakePredictionUsecaseImpl(
      getUserByIdUsecase,
      getMatchByIdUsecase,
      predictionContract as PredictionContract,
    );

    const res = await uc.call({ ...defaultParam, awayTeamScore: 2, localTeamScore: 1 });

    expect(res.eventName).toBe('PredictionNotCreatedDomainEvent');
  });
});
