import {
  GetPredictionsByMatchUsecase,
  GetPredictionsByMatchParam,
  PredictionContract,
  GottenPredictionsByMatchDomainEvent,
} from '@skorify/domain/prediction';
import { DomainEvent } from '@skorify/domain/core';

export class GetPredictionsByMatchUsecaseImpl extends GetPredictionsByMatchUsecase {
  constructor(private predictionContract: PredictionContract) {
    super();
  }

  async call(param: GetPredictionsByMatchParam): Promise<DomainEvent> {
    const { matchId } = param;

    const predictions = await this.predictionContract.filter({
      where: {
        matchId,
      },
    });
    return GottenPredictionsByMatchDomainEvent(predictions);
  }
}
