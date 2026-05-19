import {
  ClosedMatchDomainEvent,
  ClosedMatchesDomainEvent,
  CloseMatchesParam,
  CloseMatchesUsecase,
  CloseMatchUsecase,
} from '@skorify/domain/match';

import { DomainEvent, Id } from '@skorify/domain/core';

export class CloseMatchesUsecaseImpl extends CloseMatchesUsecase {
  constructor(private closeMatchUsecase: CloseMatchUsecase) {
    super();
  }

  async call(param: CloseMatchesParam): Promise<DomainEvent> {
    const { matches } = param;

    const matchesIds: Id[] = [];

    for (const match of matches) {
      const DE = await this.closeMatchUsecase.call(match);
      if (DE.is(ClosedMatchDomainEvent)) {
        matchesIds.push(match.matchId);
      }
    }

    return ClosedMatchesDomainEvent(matchesIds);
  }
}
