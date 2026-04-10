import {
  CreateMatchParam,
  CreateMatchUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class CreateMatchUsecaseImpl extends CreateMatchUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  async call(param: CreateMatchParam): Promise<DomainEvent> {
    const { matchId } = param;

    const matchInDB = await this.matchContract.getById(matchId);

    if (!matchInDB) {
      return MatchDoesNotExistDomainEvent();
    }

    return GottenMatchDomainEvent(matchInDB);
  }
}
