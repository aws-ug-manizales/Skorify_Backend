import {
  GetMatchByIdParam,
  GetMatchByIdUsecase,
  MatchDoesNotExistDomainEvent,
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class GetmatchByIdUsecaseImpl extends GetMatchByIdUsecase {
  constructor() {
    super();
  }

  async call(param: GetMatchByIdParam): Promise<DomainEvent> {
    return MatchDoesNotExistDomainEvent();
  }
}
