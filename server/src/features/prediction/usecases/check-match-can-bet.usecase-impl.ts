import { DomainEvent } from '@skorify/domain/core';
import {
  CheckMatchCanBetParam,
  CheckMatchCanBetUsecase,
  MatchBetabilityCheckedDomainEvent,
} from '@skorify/domain/prediction';
import { GetMatchByIdUsecase, GottenMatchDomainEvent, MatchDoesNotExistDomainEvent } from '@skorify/domain/match';

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

    const match = matchDE.payload as any;

    const remainingMs = match.date.getTime() - Date.now();
    const canBet = remainingMs >= match.timeToCloseInMinutes * 60 * 1000;

    return MatchBetabilityCheckedDomainEvent({ canBet });
  }
}
