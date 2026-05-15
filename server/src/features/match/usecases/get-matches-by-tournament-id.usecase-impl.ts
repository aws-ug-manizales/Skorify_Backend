import { DomainEvent } from '@skorify/domain/core';
import {
  GetMatchesByTournamentIdParam,
  GetMatchesByTournamentIdUsecase,
  GottenMatchesByTournamentDomainEvent,
  MatchContract,
} from '@skorify/domain/match';

export class GetMatchesByTournamentIdUsecaseImpl extends GetMatchesByTournamentIdUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  async call(param: GetMatchesByTournamentIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;
    console.log({tournamentId});

    const matches = await this.matchContract.filter({
      where: {
        tournamentId,
      },
    });
    return GottenMatchesByTournamentDomainEvent(matches);
  }
}
