import { MakePredictionUsecaseImpl } from '../../src/features/prediction/usecases/make-prediction.usecase-impl';
import { GottenUserDomainEvent } from '../../../domain/src/features/user/domain-events';
import { UserEntity } from '../../../domain/src/features/user/user.entity';
import { GottenMatchDomainEvent, MatchDoesNotExistDomainEvent } from '../../../domain/src/features/match/domain-events';
import { MatchEntity } from '../../../domain/src/features/match/match.entity';
import { MatchStatus } from '../../../domain/src/features/match/match.state';
import { PredictionCreatedDomainEvent, PredictionNotCreatedDomainEvent } from '../../../domain/src/features/prediction/domain-events';

describe('MakePredictionUsecaseImpl', () => {
  const userId = 'user-1';
  const matchId = 'match-1';

  function makeUser(active = true) {
    return UserEntity.build({ id: userId as any, name: 'u', isActive: active });
  }

  function makeMatch(status = MatchStatus.Scheduled, date?: Date) {
    return MatchEntity.build({ id: matchId as any, awayTeamId: 'a' as any, localTeamId: 'b' as any, date: date ?? new Date(Date.now() + 1000 * 60 * 60), status });
  }

  it('returns user not active when user is inactive', async () => {
    const getUserByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(false))) };
    const getMatchByIdUsecase: any = { call: jest.fn() };
    const predictionContract: any = { getByUserAndMatch: jest.fn(), save: jest.fn() };

    const uc = new MakePredictionUsecaseImpl(getUserByIdUsecase, getMatchByIdUsecase, predictionContract);

    const res = await uc.call({ userId: userId as any, instanceId: 'i' as any, matchId: matchId as any, awayTeamScore: 1, localTeamScore: 0 });

    expect(res.eventName).toBe('UserNotActiveDomainEvent');
  });

  it('returns match not found when match does not exist', async () => {
    const getUserByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))) };
    const getMatchByIdUsecase: any = { call: jest.fn().mockResolvedValue(MatchDoesNotExistDomainEvent()) };
    const predictionContract: any = { getByUserAndMatch: jest.fn(), save: jest.fn() };

    const uc = new MakePredictionUsecaseImpl(getUserByIdUsecase, getMatchByIdUsecase, predictionContract);

    const res = await uc.call({ userId: userId as any, instanceId: 'i' as any, matchId: matchId as any, awayTeamScore: 1, localTeamScore: 0 });

    expect(res.eventName).toBe('MatchDoesNotExistDomainEvent');
  });

  it('returns MatchCannotBeBetedDomainEvent when match cannot be bet', async () => {
    const getUserByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))) };
    const match = makeMatch(MatchStatus.InProgress);
    const getMatchByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)) };
    const predictionContract: any = { getByUserAndMatch: jest.fn(), save: jest.fn() };

    const uc = new MakePredictionUsecaseImpl(getUserByIdUsecase, getMatchByIdUsecase, predictionContract);

    const res = await uc.call({ userId: userId as any, instanceId: 'i' as any, matchId: matchId as any, awayTeamScore: 1, localTeamScore: 0 });

    expect(res.eventName).toBe('MatchCannotBeBetedDomainEvent');
  });

  it('creates prediction successfully', async () => {
    const getUserByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))) };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)) };
    const predictionContract: any = { getByUserAndMatch: jest.fn().mockResolvedValue(null), save: jest.fn().mockImplementation(async (p: any) => p) };

    const uc = new MakePredictionUsecaseImpl(getUserByIdUsecase, getMatchByIdUsecase, predictionContract);

    const res = await uc.call({ userId: userId as any, instanceId: 'i' as any, matchId: matchId as any, awayTeamScore: 2, localTeamScore: 1 });

    expect(res.eventName).toBe('PredictionCreatedDomainEvent');
  });

  it('returns PredictionNotCreatedDomainEvent when save fails', async () => {
    const getUserByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenUserDomainEvent(makeUser(true))) };
    const match = makeMatch(MatchStatus.Scheduled, new Date(Date.now() + 1000 * 60 * 60));
    const getMatchByIdUsecase: any = { call: jest.fn().mockResolvedValue(GottenMatchDomainEvent(match)) };
    const predictionContract: any = { getByUserAndMatch: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue(null) };

    const uc = new MakePredictionUsecaseImpl(getUserByIdUsecase, getMatchByIdUsecase, predictionContract);

    const res = await uc.call({ userId: userId as any, instanceId: 'i' as any, matchId: matchId as any, awayTeamScore: 2, localTeamScore: 1 });

    expect(res.eventName).toBe('PredictionNotCreatedDomainEvent');
  });
});
