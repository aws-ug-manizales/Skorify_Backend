import {
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract,
  MatchEntity,
} from "@skorify/domain/match";
import {
  PredictionContract,
  PredictionEntity,
} from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private predictionContract: PredictionContract,
  ) {
    super();
  }

  async call(param: CalculateMatchScoreParam): Promise<DomainEvent> {
    const { matchId } = param;

    const match = await this.matchContract.getById(matchId);

    if (!match) {
      return MatchDoesNotExistDomainEvent();
    }

    if (match.isMatchClose()) {
      //TODO: Change domain event to match is close
      return MatchDoesNotExistDomainEvent();
    }

    match.setScores(4, 2);
    const predictions = await this.predictionContract.filter({ matchId });

    if (predictions && predictions.length > 0) {
      await this.calculateScores(match, predictions);
    }

    return GottenMatchDomainEvent(match);
  }

  private async calculateScores(
    match: MatchEntity,
    predictions: PredictionEntity[],
  ): Promise<void> {
    for (const prediction of predictions) {
      if (
        match.awayTeamScore != undefined &&
        match.homeTeamScore != undefined
      ) {
        const result = prediction.calculateScore(
          match.awayTeamScore,
          match.homeTeamScore,
        );

        const scoreResult = result;
      }

      // await this.predictionContract.save(prediction);
    }
  }
}
