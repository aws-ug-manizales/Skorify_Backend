import { GetMatchByIdParam, GetMatchByIdUsecase } from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class GetmatchByIdUsecaseImpl extends GetMatchByIdUsecase {
  call(param: GetMatchByIdParam): Promise<DomainEvent> {
    throw new Error("Method not implemented.");
  }
}
