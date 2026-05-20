import { DomainEvent } from '@skorify/domain/core';
import {
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  GottenMatchDomainEvent,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchEntity,
} from '@skorify/domain/match';
import { PredictionContract, PredictionEntity } from '@skorify/domain/prediction';
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
    private predictionContract: PredictionContract,
    private getUserEnrollmentByIdUsecase: GetUserEnrollmentByIdUsecase,
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


    const predictions = await this.predictionContract.filter({
      where: {
        matchId,
        tournamentInstanceId,
      },
    });

    if (predictions && predictions.length > 0) {
      await this.calculateScores(match, predictions);
    }

    await this.resetStreakForMissingPredictions(matchId, tournamentInstanceId);

    return GottenMatchDomainEvent(match);
  }

  private async calculateScores(match: MatchEntity, predictions: PredictionEntity[]) {
    for (const prediction of predictions) {
      const userEnrollmentDE = await this.getUserEnrollmentByIdUsecase.call({
        userEnrollmentId: prediction.userEnrollmentId,
      });

      if (userEnrollmentDE.isNot(GottenUserEnrollmentDomainEvent)) {
        continue;
      }

      const userEnrollment: UserEnrollmentEntity = userEnrollmentDE.payload as UserEnrollmentEntity;
      const streakBonusPoints = userEnrollment.getStreakBonusPoints();

      // Calculate prediction score
      prediction.calculateScore(match.awayScore!, match.homeScore!, streakBonusPoints);

      // Save updated prediction
      await this.predictionContract.modifyById(prediction.id, prediction);

      // Update user enrollment with points and streak
      await this.updateUserEnrollmentUsecase.call({
        userEnrollmentId: prediction.userEnrollmentId,
        points: prediction.earnedPoints,
        isExact: prediction.hasExactResult,
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
