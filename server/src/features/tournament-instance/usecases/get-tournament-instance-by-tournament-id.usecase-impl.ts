import {
  GetTournamentInstanceByTournamentIdParam,
  GetTournamentInstanceByTournamentIdUsecase,
  GottenTournamentInstancesDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';
import { DomainEvent } from '@skorify/domain/core';

export class GetTournamentInstanceByTournamentIdUsecaseImpl extends GetTournamentInstanceByTournamentIdUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetTournamentInstanceByTournamentIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;

    const tournamentInstances = await this.tournamentInstanceContract.filter({
      where: {
        tournamentId,
      },
    });

    return GottenTournamentInstancesDomainEvent(tournamentInstances);
  }
}
