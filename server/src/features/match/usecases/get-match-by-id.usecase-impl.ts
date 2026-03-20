import { GetMatchByIdParam, GetMatchByIdUsecase } from "@skorify/domain/match";
import { DomainEvent } from "libs/domain/core/domain-event";

export class GetmatchByIdUsecaseImpl extends GetMatchByIdUsecase {
  call(param: GetMatchByIdParam): Promise<DomainEvent> {
    throw new Error("Method not implemented.");
  }
}
