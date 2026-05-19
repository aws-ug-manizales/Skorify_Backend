import { DomainEvent } from '@skorify/domain/core';
import {
  GetPredictionByIdParam,
  GetPredictionByIdUsecase,
  GottenPredictionDomainEvent,
  NotGottenPredictionDomainEvent,
  PredictionContract,
} from '@skorify/domain/prediction';

export class GetPredictionByIdUsecaseImpl extends GetPredictionByIdUsecase {
  constructor(private predictionContract: PredictionContract) {
    super();
  }

  async call(param: GetPredictionByIdParam): Promise<DomainEvent> {
    const { predictionId } = param;

    const Prediction = await this.predictionContract.getById(predictionId);

    if (!Prediction) {
      return NotGottenPredictionDomainEvent();
    }

    return GottenPredictionDomainEvent(Prediction);
  }
}
