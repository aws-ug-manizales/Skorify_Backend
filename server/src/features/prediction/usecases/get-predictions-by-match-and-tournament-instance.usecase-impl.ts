import {
  GetPredictionsByMatchAndTournamentInstanceUsecase,
  GetPredictionsByMatchAndTournamentInstanceParam,
  PredictionContract,
  GottenPredictionsByMatchAndTournamentInstanceDomainEvent,
} from '@skorify/domain/prediction';
import { DomainEvent } from '@skorify/domain/core';

export class GetPredictionsByMatchAndTournamentInstanceUsecaseImpl extends GetPredictionsByMatchAndTournamentInstanceUsecase {
  constructor(private predictionContract: PredictionContract) {
    super();
  }

  async call(param: GetPredictionsByMatchAndTournamentInstanceParam): Promise<DomainEvent> {
    const { matchId, tournamentInstanceId } = param;

    const predictions = await this.predictionContract.filter({
      where: {
        matchId,
        tournamentInstanceId,
      },
    });
    return GottenPredictionsByMatchAndTournamentInstanceDomainEvent(predictions);
  }
}
