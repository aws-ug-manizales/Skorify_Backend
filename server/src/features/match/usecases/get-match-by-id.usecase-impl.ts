import {
  GetMatchByIdParam,
  GetMatchByIdUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";
import { LogUsecase } from "@skorify/shared";

export class GetMatchByIdUsecaseImpl extends GetMatchByIdUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  @LogUsecase()
  async call(param: GetMatchByIdParam): Promise<DomainEvent> {
    const { matchId } = param;
  
      const matchInDB = await this.matchContract.getById(matchId);
  
      if (!matchInDB) {
        return MatchDoesNotExistDomainEvent();
      }
  
      return GottenMatchDomainEvent(matchInDB);
  }
}
