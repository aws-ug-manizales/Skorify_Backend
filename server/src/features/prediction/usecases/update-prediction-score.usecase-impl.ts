import {
  BasicDomainEvent,
  UpdatePredictionScoreParam,
  UpdatePredictionScoreUsecase,
} from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";

export class UpdatePredictionScoreUsecaseImpl extends UpdatePredictionScoreUsecase {
  constructor(
  ) {
    super();
  }

  async call(param: UpdatePredictionScoreParam): Promise<DomainEvent> {

    return BasicDomainEvent();
  }
}
