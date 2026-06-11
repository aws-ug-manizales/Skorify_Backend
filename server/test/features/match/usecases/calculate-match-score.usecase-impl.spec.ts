import { Logger } from '@aws-lambda-powertools/logger';
import { Id } from '@skorify/domain/core';
import {
  CalculatedMatchDomainEvent,
  MatchAlreadyCalculatedDomainEvent,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchEntity,
  MatchHasNotFinishedDomainEvent,
  MatchStatus,
} from '@skorify/domain/match';
import {
  EditPredictionDirectlyUsecase,
  GetPredictionsByMatchAndTournamentInstanceUsecase,
  GottenPredictionsByMatchAndTournamentInstanceDomainEvent,
  PredictionEntity,
} from '@skorify/domain/prediction';
import {
  GetEnrollmentsWithoutPredictionUsecase,
  GetUserEnrollmentByIdUsecase,
  GottenUserEnrollmentDomainEvent,
  GottenUserEnrollmentsDomainEvent,
  NotGottenUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
  UpdateUserEnrollmentUsecase,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';
import { CalculateMatchScoreUsecaseImpl } from '../../../../src/features/match/usecases/calculate-match-score.usecase-impl';

describe('CalculateMatchScoreUsecaseImpl', () => {
  const matchId = '11111111-1111-1111-1111-111111111111' as Id;
  const tiId = '22222222-2222-2222-2222-222222222222' as Id;
  const enrollmentId = '33333333-3333-3333-3333-333333333333' as Id;
  const missingEnrollmentId = '44444444-4444-4444-4444-444444444444' as Id;

  function makeMatchContract(match: MatchEntity | null): MatchContract {
    return {
      getById: jest.fn().mockResolvedValue(match),
      modify: jest.fn().mockImplementation((m: MatchEntity) => Promise.resolve(m)),
    } as unknown as MatchContract;
  }

  function makeEditPredictionDirectly(): EditPredictionDirectlyUsecase {
    return {
      call: jest.fn().mockResolvedValue(undefined),
    } as unknown as EditPredictionDirectlyUsecase;
  }

  function makeGetPredictions(
    predictions: PredictionEntity[],
  ): GetPredictionsByMatchAndTournamentInstanceUsecase {
    return {
      call: jest
        .fn()
        .mockResolvedValue(GottenPredictionsByMatchAndTournamentInstanceDomainEvent(predictions)),
    } as unknown as GetPredictionsByMatchAndTournamentInstanceUsecase;
  }

  function makeGetUserEnrollment(found: boolean): GetUserEnrollmentByIdUsecase {
    return {
      call: jest
        .fn()
        .mockResolvedValue(
          found
            ? GottenUserEnrollmentsDomainEvent([buildFakeEnrollment(enrollmentId)])
            : GottenUserEnrollmentsDomainEvent([]),
        ),
    } as unknown as GetUserEnrollmentByIdUsecase;
  }

  function makeUpdateUserEnrollment(): UpdateUserEnrollmentUsecase {
    return {
      call: jest
        .fn()
        .mockResolvedValue(SavedUserEnrollmentDomainEvent(buildFakeEnrollment(enrollmentId))),
    } as unknown as UpdateUserEnrollmentUsecase;
  }

  function makeGetMissingEnrollments(
    enrollments: UserEnrollmentEntity[],
  ): GetEnrollmentsWithoutPredictionUsecase {
    return {
      call: jest.fn().mockResolvedValue(GottenUserEnrollmentsDomainEvent(enrollments)),
    } as unknown as GetEnrollmentsWithoutPredictionUsecase;
  }

  function makeLogger() {
    return {
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as Logger;
  }

  function buildFakeMatch(): MatchEntity {
    const match = MatchEntity.build({
      id: matchId,
      homeTeamId: 'h-1' as Id,
      awayTeamId: 'a-1' as Id,
      tournamentId: 't-1' as Id,
      kickOff: new Date(),
      homeScore: 1,
      awayScore: 2,
      status: MatchStatus.Finished,
      createdAt: new Date(),
    }).payload;
    match.status = MatchStatus.Finished;
    return match;
  }

  function buildFakePrediction(isCalculated = false): PredictionEntity {
    return PredictionEntity.build({
      id: 'pred-1' as Id,
      userEnrollmentId: enrollmentId,
      matchId,
      tournamentInstanceId: tiId,
      awayScore: 2,
      homeScore: 1,
      hasExactResult: false,
      earnedPoints: 0,
      isCalculated,
      userId: 'u-1' as Id,
      createdAt: new Date(),
    }).payload;
  }

  function buildFinishedMatch(): MatchEntity {
    return buildFakeMatch();
  }

  function buildScheduledMatch(): MatchEntity {
    const match = buildFakeMatch();
    match.status = MatchStatus.Scheduled;
    return match;
  }

  function buildFakeEnrollment(id: Id): UserEnrollmentEntity {
    return UserEnrollmentEntity.build({
      id,
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

  function buildUsecase(overrides: {
    match?: MatchEntity | null;
    predictions?: PredictionEntity[];
    enrollmentFound?: boolean;
    missing?: UserEnrollmentEntity[];
  }) {
    const match = 'match' in overrides ? (overrides.match ?? null) : buildFakeMatch();
    const matchContract = makeMatchContract(match);
    const editPredictionDirectly = makeEditPredictionDirectly();
    const getUserEnrollment = makeGetUserEnrollment(overrides.enrollmentFound ?? true);
    const getPredictions = makeGetPredictions(overrides.predictions ?? []);
    const updateUserEnrollment = makeUpdateUserEnrollment();
    const getMissingEnrollments = makeGetMissingEnrollments(overrides.missing ?? []);
    const logger = makeLogger();

    const usecase = new CalculateMatchScoreUsecaseImpl(
      matchContract,
      editPredictionDirectly,
      getUserEnrollment,
      getPredictions,
      updateUserEnrollment,
      getMissingEnrollments,
      logger,
    );

    return {
      usecase,
      matchContract,
      editPredictionDirectly,
      getUserEnrollment,
      updateUserEnrollment,
      getMissingEnrollments,
      logger,
    };
  }

  it('puntúa la predicción cuando el enrollment existe y marca el partido como calculado', async () => {
    const { usecase, editPredictionDirectly, updateUserEnrollment, matchContract, logger } =
      buildUsecase({
        predictions: [buildFakePrediction()],
        enrollmentFound: true,
        missing: [buildFakeEnrollment(missingEnrollmentId)],
      });

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(CalculatedMatchDomainEvent)).toBe(true);
    // Se puntuó la predicción pendiente del participante...
    expect(editPredictionDirectly.call).toHaveBeenCalledTimes(1);
    expect(updateUserEnrollment.call).toHaveBeenCalledWith(
      expect.objectContaining({ userEnrollmentId: enrollmentId }),
    );
    // ...y se reinició la racha de quien NO predijo.
    expect(updateUserEnrollment.call).toHaveBeenCalledWith({
      userEnrollmentId: missingEnrollmentId,
      points: 0,
      isExact: false,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('loguea un warn y omite la predicción cuando el enrollment no se encuentra (punto ciego)', async () => {
    const prediction = buildFakePrediction();
    const { usecase, editPredictionDirectly, logger } = buildUsecase({
      predictions: [prediction],
      enrollmentFound: false,
    });

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    // El partido igual queda calculado, pero la predicción se omitió...
    expect(result.is(CalculatedMatchDomainEvent)).toBe(true);
    expect(editPredictionDirectly.call).not.toHaveBeenCalled();
    // ...y ahora SÍ deja rastro estructurado.
    expect(logger.warn).toHaveBeenCalledWith(
      'Prediction score skipped',
      expect.objectContaining({
        matchId,
        predictionId: prediction.id,
        userEnrollmentId: prediction.userEnrollmentId,
        reason: 'enrollment_not_found',
      }),
    );
  });

  it('devuelve MatchDoesNotExistDomainEvent si el partido no existe', async () => {
    const { usecase } = buildUsecase({ match: null, predictions: [buildFakePrediction()] });

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(MatchDoesNotExistDomainEvent)).toBe(true);
  });

  it('devuelve MatchHasNotFinishedDomainEvent si el partido no está finalizado', async () => {
    const { usecase, editPredictionDirectly } = buildUsecase({
      match: buildScheduledMatch(),
      predictions: [buildFakePrediction()],
    });

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(MatchHasNotFinishedDomainEvent)).toBe(true);
    expect(editPredictionDirectly.call).not.toHaveBeenCalled();
  });

  it('es idempotente: si todas las predicciones ya están calculadas devuelve MatchAlreadyCalculated y no re-puntúa', async () => {
    const { usecase, editPredictionDirectly } = buildUsecase({
      match: buildFinishedMatch(),
      predictions: [buildFakePrediction(true)],
    });

    const result = await usecase.call({ matchId, tournamentInstanceId: tiId });

    expect(result.is(MatchAlreadyCalculatedDomainEvent)).toBe(true);
    expect(editPredictionDirectly.call).not.toHaveBeenCalled();
  });
});
