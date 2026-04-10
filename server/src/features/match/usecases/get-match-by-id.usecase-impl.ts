import {
  GetMatchByIdParam,
  GetMatchByIdUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class GetMatchByIdUsecaseImpl extends GetMatchByIdUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  async call(param: GetMatchByIdParam): Promise<DomainEvent> {
    const { matchId } = param;
  
      const matchInDB = await this.matchContract.getById(matchId);
  
      if (!matchInDB) {
        return MatchDoesNotExistDomainEvent();
      }
  
      return GottenMatchDomainEvent(matchInDB);
  }
}
