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

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private predictionContract: PredictionContract,
  ) {
    super();
  }

  async call(param: CalculateMatchScoreParam): Promise<DomainEvent> {
    const { matchId } = param;
    console.log('Ejecutando el caso de uso reactivo');
    

    const match = await this.matchContract.getById(matchId);

    if (!match) {
      return MatchDoesNotExistDomainEvent();
    }

    if (match.isMatchClose()) {
      //TODO: Change domain event to match is close
      return MatchDoesNotExistDomainEvent();
    }

    match.setScores(4, 2);
    const predictions = await this.predictionContract.filter({ where: { matchId } });

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
      if (match.awayTeamScore != undefined && match.homeTeamScore != undefined) {
        prediction.calculateScore(match.awayTeamScore, match.homeTeamScore);
      }

      // await this.predictionContract.save(prediction);
    }
  }
}
