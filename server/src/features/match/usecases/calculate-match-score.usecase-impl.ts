import {
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract,
  MatchEntity
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";
import { PredictionContract, PredictionEntity } from "@skorify/domain/prediction";

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
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
    const predictions = await this.matchContract.getPredictionsByMatchId(matchId);

    if (predictions && predictions.length > 0) {
      await this.calculateScores(match, predictions);
    }

    return GottenMatchDomainEvent(match);
  }

  private async calculateScores(match: MatchEntity, predictions: PredictionEntity[]): Promise<void> {

    for (const prediction of predictions) {
      const result = prediction.calculateScore(match.awayTeamScore, match.localTeamScore);


      const scoreResult = result;
      console.log({
        predictionId: prediction.id, 
        prediction: `${prediction.awayTeamScore}:${prediction.localTeamScore}`, 
        matchResult: `${match.awayTeamScore}:${match.localTeamScore}`, 
        scoreResult: scoreResult.total, 
        breakdown: scoreResult.breakdown 
      });

      // await this.predictionContract.save(prediction);

    }
  }
}


