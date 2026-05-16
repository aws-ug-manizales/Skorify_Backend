import { DomainEvent } from '@skorify/domain/core';
import {
  GetTournamentInstancesByTournamentIdParam,
  GetTournamentInstancesByTournamentIdUsecase,
  GottenTournamentInstancesDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';

export class GetTournamentInstancesByTournamentIdUsecaseImpl extends GetTournamentInstancesByTournamentIdUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetTournamentInstancesByTournamentIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;
    const tournamentInstances = await this.tournamentInstanceContract.filter({
      where: {
        tournamentId,
      },
    });

    return GottenTournamentInstancesDomainEvent(tournamentInstances);
  }
}
