import {
  CalculateMatchScoreUsecase,
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
} from '@skorify/domain/match';

import { Logger } from '@aws-lambda-powertools/logger';

import { DomainEvent } from '@skorify/domain/core';
import {
  GetTournamentInstancesByTournamentIdUsecase,
  GottenTournamentInstancesDomainEvent,
  TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';

export class CloseMatchUsecaseImpl extends CloseMatchUsecase {
  constructor(
    private getMatchByIdUsecase: GetMatchByIdUsecase,
    private matchContract: MatchContract,
    private calculateMatchScoreUsecase: CalculateMatchScoreUsecase,
    private getTournamentInstancesByTournamentIdUsecase: GetTournamentInstancesByTournamentIdUsecase,
    private logger: Logger,
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
      try {
        await this.calculateMatchScoreUsecase.call({
          matchId,
          tournamentInstanceId: tournamentInstance.id,
        });
      } catch (err) {
        this.logger.error('Error calculando el score del partido', { err });
      }
    }
    return ClosedMatchDomainEvent(modified);
  }
}
