import {
  GetPredictionsByUserParam,
  GetPredictionsByUserUsecase,
  GottenPredictionsByUserDomainEvent,
  PredictionContract,
} from '@skorify/domain/prediction';
import { DomainEvent } from '@skorify/domain/core';

export class GetPredictionsByUserUsecaseImpl extends GetPredictionsByUserUsecase {
  constructor(private predictionContract: PredictionContract) {
    super();
  }

  async call(param: GetPredictionsByUserParam): Promise<DomainEvent> {
    const { tournamentInstanceId, userId } = param;

    const predictions = await this.predictionContract.filter({
      where: {
        tournamentInstanceId,
        userId,
      },
    });
    return GottenPredictionsByUserDomainEvent(predictions);
  }
}
