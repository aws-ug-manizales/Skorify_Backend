import { DomainEvent } from '@skorify/domain/core';
import {
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  GottenMatchDomainEvent,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchEntity,
} from '@skorify/domain/match';
import {
  EditPredictionDirectlyUsecase,
  GetPredictionsByMatchAndTournamentInstanceUsecase,
  PredictionContract,
  PredictionEntity,
} from '@skorify/domain/prediction';
import {
  GetUserEnrollmentByIdUsecase,
  GottenUserEnrollmentDomainEvent,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentEntity,
  UpdateUserEnrollmentUsecase,
  GetEnrollmentsWithoutPredictionUsecase,
} from '@skorify/domain/user-enrollment';

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private editPredictionDirectlyUsecase: EditPredictionDirectlyUsecase,
    private getUserEnrollmentByIdUsecase: GetUserEnrollmentByIdUsecase,
    private getPredictionsByMatchAndTournamentInstanceUsecase: GetPredictionsByMatchAndTournamentInstanceUsecase,
    private updateUserEnrollmentUsecase: UpdateUserEnrollmentUsecase,
    private getEnrollmentsWithoutPredictionUsecase: GetEnrollmentsWithoutPredictionUsecase,
  ) {
    super();
  }

  async call(param: CalculateMatchScoreParam): Promise<DomainEvent> {
    const { matchId, tournamentInstanceId } = param;

    const match = await this.matchContract.getById(matchId);

    if (!match) {
      return MatchDoesNotExistDomainEvent();
    }

    const predictionsDE = await this.getPredictionsByMatchAndTournamentInstanceUsecase.call({
      matchId,
      tournamentInstanceId,
    });
    const predictions: PredictionEntity[] = predictionsDE.payload as PredictionEntity[];

    if (predictions && predictions.length > 0) {
      await this.calculateScores(match, predictions);
    }

    await this.resetStreakForMissingPredictions(matchId, tournamentInstanceId);

    return GottenMatchDomainEvent(match);
  }

  private async calculateScores(match: MatchEntity, predictions: PredictionEntity[]) {
    for (const prediction of predictions) {
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
      });

      const clonedPrediction = clonedPredictionDE.payload as PredictionEntity;


      clonedPrediction.createdAt = new Date(prediction.createdAt);

      const userEnrollmentDE = await this.getUserEnrollmentByIdUsecase.call({
        userEnrollmentId: prediction.userEnrollmentId,
      });

      if (userEnrollmentDE.isNot(GottenUserEnrollmentDomainEvent)) {
        continue;
      }

      const userEnrollment: UserEnrollmentEntity = userEnrollmentDE.payload as UserEnrollmentEntity;

      /** Esto es un machetazo */
      const clonedUserEnrollmentDE = UserEnrollmentEntity.build({
        id: userEnrollment.id,
        maxStreak: userEnrollment.maxStreak,
        currentPosition: userEnrollment.currentPosition,
        currentScore: userEnrollment.currentScore,
        createdAt: userEnrollment.createdAt,
        joinedAt: userEnrollment.joinedAt,
        lastPosition: userEnrollment.lastPosition,
        tournamentId: userEnrollment.tournamentId,
        streak: userEnrollment.streak,
        tournamentInstanceId: userEnrollment.tournamentInstanceId,
        userId: userEnrollment.userId,
      });

      const clonedUserEnrollment = clonedUserEnrollmentDE.payload as UserEnrollmentEntity;

      clonedUserEnrollment.createdAt = new Date(userEnrollment.createdAt);
      clonedUserEnrollment.joinedAt = new Date(userEnrollment.joinedAt);

      const streakBonusPoints = clonedUserEnrollment.getStreakBonusPoints();

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

      for (const enrollment of enrollments) {
        
        await this.updateUserEnrollmentUsecase.call({
          userEnrollmentId: enrollment.id,
          points: 0,
          isExact: false,
        });
      }
    }
  }
}
