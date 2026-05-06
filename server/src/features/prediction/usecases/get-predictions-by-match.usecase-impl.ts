import { DomainEvent } from "@skorify/domain/core";
import {
  GetPredictionsByMatchParam,
  GetPredictionsByMatchUsecase,
  GottenPredictionsDomainEvent,
  PredictionContract,
} from "@skorify/domain/prediction";

export class GetPredictionsByMatchUsecaseImpl extends GetPredictionsByMatchUsecase {
  constructor(private predictionContract: PredictionContract) {
    super();
  }

  async call(param: GetPredictionsByMatchParam): Promise<DomainEvent> {
    const { matchId } = param;
    const response = await this.predictionContract.filter({
      matchId,
    });
    return GottenPredictionsDomainEvent(response);
  }
}
