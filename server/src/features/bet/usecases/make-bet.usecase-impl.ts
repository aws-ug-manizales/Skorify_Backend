import {
  BasicDomainEvent,
  MakeBetParam,
  MakeBetUsecase,
} from "@skorify/domain/bet";
import { DomainEvent } from "@skorify/domain/core";
import {
  GetUserByIdUsecase,
  GottenUserDomainEvent,
} from "@skorify/domain/user";
import { GetMatchByIdUsecase, GottenMatchDomainEvent, MatchCannotBeBetedDomainEvent, MatchEntity } from "@skorify/domain/match";

export class MakeBetUsecaseImpl extends MakeBetUsecase {
  constructor(
    private getUserByIdUsecase: GetUserByIdUsecase,
    private getMatchByIdUsecase: GetMatchByIdUsecase,
  ) {
    super();
  }

  async call(param: MakeBetParam): Promise<DomainEvent> {
    console.log(param);
    const { awayTeamScore, localTeamScore, matchId, userId } = param;

    // 1. Validación de que dalia exista
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return userDE;
    }
    // 2. Valida el partido
    const matchDE = await this.getMatchByIdUsecase.call({
      matchId,
    });

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE;
    }

    const match = matchDE.payload as MatchEntity;

    if (!match.canBet()) {
      return MatchCannotBeBetedDomainEvent();
    }

    // make bet

    return BasicDomainEvent();
  }
}
