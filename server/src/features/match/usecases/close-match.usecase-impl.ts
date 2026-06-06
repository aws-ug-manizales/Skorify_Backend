import {
  ClosedMatchDomainEvent,
  CloseMatchParam,
  CloseMatchUsecase,
  GetMatchByIdUsecase,
  GottenMatchDomainEvent,
  MatchAlreadyClosedDomainEvent,
  MatchContract,
  MatchEntity,
  MatchStatus,
  NotEditedMatchDomainEvent,
  ReactiveClosedMatchDomainEvent,
} from '@skorify/domain/match';

import { DomainEvent, EventBusContract } from '@skorify/domain/core';
import {
  GetTournamentInstancesByTournamentIdUsecase,
  GottenTournamentInstancesDomainEvent,
  TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';

export class CloseMatchUsecaseImpl extends CloseMatchUsecase {
  constructor(
    private getMatchByIdUsecase: GetMatchByIdUsecase,
    private eventBusContract: EventBusContract,
    private matchContract: MatchContract,
    private getTournamentInstancesByTournamentIdUsecase: GetTournamentInstancesByTournamentIdUsecase,
  ) {
    super();
  }

  async call(param: CloseMatchParam): Promise<DomainEvent> {
    const { matchId, homeScore, awayScore } = param;

    const matchDE = await this.getMatchByIdUsecase.call({
      matchId,
    });

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE;
    }
    const match: MatchEntity = matchDE.payload;
    const status = match.status ?? match['_status'];

    if (status == MatchStatus.Finished) {
      return MatchAlreadyClosedDomainEvent(match);
    }

    match.status = MatchStatus.Finished;
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    const modified = await this.matchContract.modify(match);

    if (!modified) {
      return NotEditedMatchDomainEvent(match);
    }

    const tournamentInstancesDE = await this.getTournamentInstancesByTournamentIdUsecase.call({
      tournamentId: match.tournamentId,
    });

    if (tournamentInstancesDE.isNot(GottenTournamentInstancesDomainEvent)) {
      return tournamentInstancesDE;
    }
    const tournamentInstances: TournamentInstanceEntity[] = tournamentInstancesDE.payload;

    for (const tournamentInstance of tournamentInstances) {
      this.eventBusContract.send({
        domainEvent: ReactiveClosedMatchDomainEvent, // Estandar para nosotros
        payload: { match, tournamentInstance },
      });
    }

    return ClosedMatchDomainEvent(modified);
  }
}
