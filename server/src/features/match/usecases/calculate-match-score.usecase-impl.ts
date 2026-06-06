import { DomainEvent } from '@skorify/domain/core';
import {
  CalculatedMatchDomainEvent,
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchHasNotFinishedDomainEvent,
  MatchStatus,
} from '@skorify/domain/match';
import {
  GetPredictionsByMatchAndTournamentInstanceUsecase,
  PredictionEntity,
} from '@skorify/domain/prediction';
import {
  GetEnrollmentsWithoutPredictionUsecase,
  GottenUserEnrollmentsDomainEvent,
  ResetStreakForMatchUsecase,
  ScorePredictionUsecase,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private scorePredictionUsecase: ScorePredictionUsecase,
    private resetStreakForMatchUsecase: ResetStreakForMatchUsecase,
    private getPredictionsByMatchAndTournamentInstanceUsecase: GetPredictionsByMatchAndTournamentInstanceUsecase,
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

    // Only score once the match is finished (has a result). The match status is
    // GLOBAL across tournament instances and stays Finished; per-prediction
    // idempotency comes from the `is_calculated` flag, so every instance can
    // score its own predictions without a global lock.
    if (match.status !== MatchStatus.Finished) {
      return MatchHasNotFinishedDomainEvent(match);
    }

    const predictionsDE = await this.getPredictionsByMatchAndTournamentInstanceUsecase.call({
      matchId,
      tournamentInstanceId,
    });
    const predictions: PredictionEntity[] =
      (predictionsDE.payload as PredictionEntity[]) ?? [];

    // Only score predictions not yet calculated (optimization; scorePrediction
    // is idempotent and re-checks the flag under the lock anyway).
    const pending = predictions.filter((p) => !p.isCalculated);

    if (pending.length > 0) {
      await Promise.all(
        pending.map((prediction) =>
          this.scorePredictionUsecase.call({
            predictionId: prediction.id,
            matchAwayScore: match.awayScore!,
            matchHomeScore: match.homeScore!,
          }),
        ),
      );
    }

    await this.resetStreakForMissingPredictions(matchId, tournamentInstanceId);

    // No global status change: the match stays Finished. Idempotency is per
    // prediction via `is_calculated`, so re-runs (other instances, retries) are
    // safe and do not double-count.
    return CalculatedMatchDomainEvent(match);
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

      await Promise.all(
        enrollments.map((enrollment) =>
          this.resetStreakForMatchUsecase.call({
            enrollmentId: enrollment.id,
            matchId,
          }),
        ),
      );
    }
  }
}
