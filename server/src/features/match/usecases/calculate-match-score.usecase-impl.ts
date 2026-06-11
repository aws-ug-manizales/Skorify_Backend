import { DomainEvent } from '@skorify/domain/core';
import {
  CalculatedMatchDomainEvent,
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
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
  PredictionEntity,
} from '@skorify/domain/prediction';
import {
  GetEnrollmentsWithoutPredictionUsecase,
  GetUserEnrollmentByIdUsecase,
  GetUserEnrollmentsByTournamentInstanceIdUsecase,
  GottenUserEnrollmentDomainEvent,
  GottenUserEnrollmentsDomainEvent,
  UpdateUserEnrollmentUsecase,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';
import { Logger } from '@aws-lambda-powertools/logger';

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private editPredictionDirectlyUsecase: EditPredictionDirectlyUsecase,
    private getUserEnrollmentsByTournamentInstanceIdUsecase: GetUserEnrollmentsByTournamentInstanceIdUsecase,
    private getPredictionsByMatchAndTournamentInstanceUsecase: GetPredictionsByMatchAndTournamentInstanceUsecase,
    private updateUserEnrollmentUsecase: UpdateUserEnrollmentUsecase,
    private getEnrollmentsWithoutPredictionUsecase: GetEnrollmentsWithoutPredictionUsecase,
    private logger: Logger,
  ) {
    super();
  }

  async call(param: CalculateMatchScoreParam): Promise<DomainEvent> {
    const { matchId, tournamentInstanceId } = param;

    const match = await this.matchContract.getById(matchId);

    this.logger.info('Calculando los score de un partido', {
      matchId: matchId,
    });

    if (!match) {
      return MatchDoesNotExistDomainEvent();
    }

    if (match.status !== MatchStatus.Finished) {
      return MatchHasNotFinishedDomainEvent(match);
    }

    const userEnrollmentsDE = await this.getUserEnrollmentsByTournamentInstanceIdUsecase.call({
      tournamentInstanceId,
    });

    const userEnrollments: UserEnrollmentEntity[] = await userEnrollmentsDE.payload;

    const predictionsDE = await this.getPredictionsByMatchAndTournamentInstanceUsecase.call({
      matchId,
      tournamentInstanceId,
    });
    const predictions: PredictionEntity[] = predictionsDE.payload as PredictionEntity[];
    const pendingPredictions = predictions.filter((prediction) => !prediction.isCalculated);

    this.logger.info(`Predicciones por el partido ${matchId}`, {
      matchId: matchId,
      predictions: predictions.length,
      pendingPredictions: pendingPredictions.length,
    });
    if (predictions.length > 0 && pendingPredictions.length === 0) {
      return MatchAlreadyCalculatedDomainEvent(match);
    }

    if (pendingPredictions.length > 0) {
      await this.calculateScores(match, pendingPredictions, userEnrollments);
    }

    await this.resetStreakForMissingPredictions(matchId, tournamentInstanceId);

    // match.status = MatchStatus.Finished;
    // await this.matchContract.modify(match);

    return CalculatedMatchDomainEvent(match);
  }

  private readonly SCORE_BATCH_SIZE = 10;

  private async calculateScores(
    match: MatchEntity,
    predictions: PredictionEntity[],
    userEnrollments: UserEnrollmentEntity[],
  ) {
    let intent = 0;
    for (let i = 0; i < predictions.length; i += this.SCORE_BATCH_SIZE) {
      const batch = predictions.slice(i, i + this.SCORE_BATCH_SIZE);
      try {
        await Promise.all(
          batch.map((prediction) =>
            this.calculatePredictionScore(match, prediction, userEnrollments),
          ),
        );
      } catch (error) {
        this.logger.info(`Error en un grupo de cálculo ${intent}`, {
          calculatedPredictions: batch.length,
        });
      }
    }
  }

  private async calculatePredictionScore(
    match: MatchEntity,
    prediction: PredictionEntity,
    userEnrollments: UserEnrollmentEntity[],
  ): Promise<void> {
    /** Esto es un machetazo */
    const clonedPredictionDE = PredictionEntity.build({
      id: prediction.id,
      createdAt: prediction.createdAt,
      userEnrollmentId: prediction.userEnrollmentId,
      matchId: prediction.matchId,
      tournamentInstanceId: prediction.tournamentInstanceId,
      userId: prediction.userId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      earnedPoints: prediction.earnedPoints,
      hasExactResult: prediction.hasExactResult,
      isCalculated: true,
    });

    const clonedPrediction = clonedPredictionDE.payload as PredictionEntity;

    clonedPrediction.createdAt = new Date(prediction.createdAt);

    const userEnrollment = userEnrollments.find((x) => x.id == prediction.userEnrollmentId);

    if (!userEnrollment) {
      this.logger.warn('Prediction score skipped', {
        matchId: match.id,
        predictionId: prediction.id,
        userEnrollmentId: prediction.userEnrollmentId,
        reason: 'enrollment_not_found',
      });
      return;
    }

    /** Esto es un machetazo */
    const clonedUserEnrollmentDE = UserEnrollmentEntity.build({
      id: userEnrollment.id,
      maxStreak: 0, //userEnrollment.maxStreak,
      currentPosition: userEnrollment.currentPosition,
      currentScore: userEnrollment.currentScore,
      createdAt: userEnrollment.createdAt,
      joinedAt: userEnrollment.joinedAt,
      lastPosition: userEnrollment.lastPosition,
      tournamentId: userEnrollment.tournamentId,
      streak: 0, //userEnrollment.streak,
      tournamentInstanceId: userEnrollment.tournamentInstanceId,
      userId: userEnrollment.userId,
    });

    const clonedUserEnrollment = clonedUserEnrollmentDE.payload as UserEnrollmentEntity;

    clonedUserEnrollment.createdAt = new Date(userEnrollment.createdAt);
    clonedUserEnrollment.joinedAt = new Date(userEnrollment.joinedAt);

    const streakBonusPoints = 0; //clonedUserEnrollment.getStreakBonusPoints();

    // Calculate prediction score
    clonedPrediction.calculateScore(match.awayScore!, match.homeScore!, streakBonusPoints);

    // Save updated prediction
    await this.editPredictionDirectlyUsecase.call({
      predictionId: prediction.id,
      ...clonedPrediction,
    });

    // Update user enrollment with points and streak
    await this.updateUserEnrollmentUsecase.call({
      userEnrollmentId: clonedPrediction.userEnrollmentId,
      points: clonedPrediction.earnedPoints,
      isExact: clonedPrediction.hasExactResult,
    });
  }

  private async resetStreakForMissingPredictions(
    matchId: string,
    tournamentInstanceId: string,
  ): Promise<void> {
    const missingEnrollmentsDE = await this.getEnrollmentsWithoutPredictionUsecase.call({
      matchId,
      tournamentInstanceId,
    });

    if (missingEnrollmentsDE.is(GottenUserEnrollmentsDomainEvent)) {
      const enrollments: UserEnrollmentEntity[] =
        missingEnrollmentsDE.payload as UserEnrollmentEntity[];

      try {
        await Promise.all(
          enrollments.map((enrollment) =>
            this.updateUserEnrollmentUsecase.call({
              userEnrollmentId: enrollment.id,
              points: 0,
              isExact: false,
            }),
          ),
        );
      } catch (error) {
        this.logger.warn('Error en resetStreakForMissingPredictions', {
          matchId,
          tournamentInstanceId,
        });
      }
    }
  }
}
