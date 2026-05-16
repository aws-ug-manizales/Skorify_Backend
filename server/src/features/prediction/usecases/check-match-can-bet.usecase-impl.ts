import { DomainEvent } from '@skorify/domain/core';
import {
  CheckMatchCanBetParam,
  CheckMatchCanBetUsecase,
  MatchBetabilityCheckedDomainEvent,
} from '@skorify/domain/prediction';
import { GetMatchByIdUsecase, GottenMatchDomainEvent, MatchEntity } from '@skorify/domain/match';

export class CheckMatchCanBetUsecaseImpl extends CheckMatchCanBetUsecase {
  constructor(private getMatchByIdUsecase: GetMatchByIdUsecase) {
    super();
  }

  async call(param: CheckMatchCanBetParam): Promise<DomainEvent> {
    const { matchId } = param;

    const matchDE = await this.getMatchByIdUsecase.call({ matchId });

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE; // propagate not found or other match events
    }

    const match = matchDE.payload as MatchEntity;

    const remainingMs = match.kickOff.getTime() - Date.now();
    const canBet = remainingMs >= match.timeToCloseInMinutes * 60 * 1000;

    return MatchBetabilityCheckedDomainEvent({ canBet });
  }
}
