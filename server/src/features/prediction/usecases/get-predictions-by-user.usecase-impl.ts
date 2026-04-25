import {
  BasicDomainEvent,
  GetPredictionsByUserParam,
  GetPredictionsByUserUsecase,
} from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";

export class GetPredictionsByUserUsecaseImpl extends GetPredictionsByUserUsecase {
  constructor() {
    super();
  }

  async call(param: GetPredictionsByUserParam): Promise<DomainEvent> {
    return BasicDomainEvent();
  }
}
