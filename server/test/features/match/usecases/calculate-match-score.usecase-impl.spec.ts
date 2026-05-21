import { CalculateMatchScoreUsecaseImpl } from '../../../../src/features/match/usecases/calculate-match-score.usecase-impl';
import {
  MatchContract,
  MatchEntity,
  GottenMatchDomainEvent,
  MatchDoesNotExistDomainEvent,
} from '@skorify/domain/match';
import { PredictionContract, PredictionEntity } from '@skorify/domain/prediction';
import {
  GetUserEnrollmentByIdUsecase,
  UpdateUserEnrollmentUsecase,
  GetEnrollmentsWithoutPredictionUsecase,
  GottenUserEnrollmentDomainEvent,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentEntity,
  SavedUserEnrollmentDomainEvent,
} from '@skorify/domain/user-enrollment';
import { Id } from '@skorify/domain/core';

describe('CalculateMatchScoreUsecaseImpl', () => {
  const matchId = '11111111-1111-1111-1111-111111111111' as Id;
  const tiId = '22222222-2222-2222-2222-222222222222' as Id;
  const enrollmentId = '33333333-3333-3333-3333-333333333333' as Id;
  const missingEnrollmentId = '44444444-4444-4444-4444-444444444444' as Id;

  function makeMockMatchContract(match: MatchEntity | null): MatchContract {
    return {
      getById: jest.fn().mockResolvedValue(match),
    } as unknown as MatchContract;
  }

  function makeMockPredictionContract(predictions: PredictionEntity[]): PredictionContract {
    return {
      filter: jest.fn().mockResolvedValue(predictions),
      modify: jest
        .fn()
        .mockImplementation((id: string, ent: PredictionEntity) => Promise.resolve(ent)),
    } as unknown as PredictionContract;
  }

  function makeMockGetUserEnrollmentUsecase(
    enrollment: UserEnrollmentEntity,
  ): GetUserEnrollmentByIdUsecase {
    return {
      call: jest.fn().mockResolvedValue(GottenUserEnrollmentDomainEvent(enrollment)),
    } as unknown as GetUserEnrollmentByIdUsecase;
  }

  function makeMockUpdateUserEnrollmentUsecase(): UpdateUserEnrollmentUsecase {
    return {
      call: jest.fn().mockResolvedValue(SavedUserEnrollmentDomainEvent),
    } as unknown as UpdateUserEnrollmentUsecase;
  }

  function makeMockGetEnrollmentsWithoutPredictionUsecase(
    enrollments: UserEnrollmentEntity[],
  ): GetEnrollmentsWithoutPredictionUsecase {
    return {
      call: jest.fn().mockResolvedValue(GottenUserEnrollmentsDomainEvent(enrollments)),
    } as unknown as GetEnrollmentsWithoutPredictionUsecase;
  }

  function buildFakeMatch(awayScore?: number, homeScore?: number): MatchEntity {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);

    const match = MatchEntity.build({
      id: matchId,
      homeTeamId: 'h-1' as Id,
      awayTeamId: 'a-1' as Id,
      tournamentId: 't-1' as Id,
      kickOff: futureDate,
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      createdAt: new Date(),
    }).payload;

    if (awayScore === undefined) {
      match.awayScore = undefined;
    }
    if (homeScore === undefined) {
      match.homeScore = undefined;
    }

    return match;
  }

  function buildFakePrediction(): PredictionEntity {
    const pred = PredictionEntity.build({
      id: 'pred-1' as Id,
      userEnrollmentId: enrollmentId,
      matchId: matchId,
      tournamentInstanceId: tiId,
      awayScore: 2,
      homeScore: 1,
      hasExactResult: false,
      earnedPoints: 0,
      userId: '' as Id,
    }).payload;
    pred.earnedPoints = 4;
    pred.calculateScore = jest
      .fn()
      .mockReturnValue({ total: 4, breakdown: [{ rule: 'ExactScoreRule', points: 1 }] });
    pred.hasExactResult = true;
    return pred;
  }

  function buildFakeEnrollment(id: Id): UserEnrollmentEntity {
    return UserEnrollmentEntity.build({
      id: id,
      userId: 'u-1' as Id,
      tournamentInstanceId: tiId,
      tournamentId: 't-1' as Id,
      joinedAt: new Date(),
      lastPosition: 1,
      currentPosition: 1,
      currentScore: 0,
      streak: 0,
      maxStreak: 0,
    }).payload;
  }

  it('should calculate score for participants and reset streak for non-participants', async () => {
    const match = buildFakeMatch(2, 1);
    const prediction = buildFakePrediction();
    const activeEnrollment = buildFakeEnrollment(enrollmentId);
    const missingEnrollment = buildFakeEnrollment(missingEnrollmentId);

    const matchContract = makeMockMatchContract(match);
    const predictionContract = makeMockPredictionContract([prediction]);
    const getUserEnrollment = makeMockGetUserEnrollmentUsecase(activeEnrollment);
    const updateUserEnrollment = makeMockUpdateUserEnrollmentUsecase();
    const getMissingEnrollments = makeMockGetEnrollmentsWithoutPredictionUsecase([
      missingEnrollment,
    ]);

    const usecase = new CalculateMatchScoreUsecaseImpl(
      matchContract,
      predictionContract,
      getUserEnrollment,
      updateUserEnrollment,
      getMissingEnrollments,
    );

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(GottenMatchDomainEvent)).toBe(true);

    // Validar actualización de quien sí predijo
    expect(updateUserEnrollment.call).toHaveBeenCalledWith({
      userEnrollmentId: enrollmentId,
      points: prediction.earnedPoints,
      isExact: true,
    });

    // Validar reinicio de racha de quien NO predijo
    expect(updateUserEnrollment.call).toHaveBeenCalledWith({
      userEnrollmentId: missingEnrollmentId,
      points: 0,
      isExact: false,
    });
  });

  it('should return MatchDoesNotExistDomainEvent if match is not found', async () => {
    const prediction = buildFakePrediction();
    const activeEnrollment = buildFakeEnrollment(enrollmentId);
    const missingEnrollment = buildFakeEnrollment(missingEnrollmentId);

    const matchContract = makeMockMatchContract(null);
    const predictionContract = makeMockPredictionContract([prediction]);
    const getUserEnrollment = makeMockGetUserEnrollmentUsecase(activeEnrollment);
    const updateUserEnrollment = makeMockUpdateUserEnrollmentUsecase();
    const getMissingEnrollments = makeMockGetEnrollmentsWithoutPredictionUsecase([
      missingEnrollment,
    ]);
    const usecase = new CalculateMatchScoreUsecaseImpl(
      matchContract,
      predictionContract,
      getUserEnrollment,
      updateUserEnrollment,
      getMissingEnrollments,
    );

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(MatchDoesNotExistDomainEvent)).toBe(true);
  });
});
