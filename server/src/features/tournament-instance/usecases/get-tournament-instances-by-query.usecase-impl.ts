import { DomainEvent, Like } from '@skorify/domain/core';
import {
  GetTournamentInstancesByQueryParam,
  GetTournamentInstancesByQueryUsecase,
  GottenTournamentInstancesDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';

export class GetTournamentInstancesByQueryUsecaseImpl extends GetTournamentInstancesByQueryUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetTournamentInstancesByQueryParam): Promise<DomainEvent> {
    const { query } = param;

    const teams = await this.tournamentInstanceContract.filter({
      where: {
        name: Like(`%${query}%`),
      },
    });

    return GottenTournamentInstancesDomainEvent(teams);
  }
}
