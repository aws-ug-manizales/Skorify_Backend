import { DomainEvent, Like } from '@skorify/domain/core';

import {
  GetGlobalTournamentInstanceParam,
  GetGlobalTournamentInstanceUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';

export class GetGlobalTournamentInstanceUsecaseImpl extends GetGlobalTournamentInstanceUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetGlobalTournamentInstanceParam): Promise<DomainEvent> {
    const { tournamentId } = param;
    const [globalInstance] = await this.tournamentInstanceContract.filter({
      where: {
        tournamentId: {
          type: 'equals',
          value: tournamentId,
        },
        name: Like(`%Global`),
      },
    });

    if (!globalInstance) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    return GottenTournamentInstanceDomainEvent(globalInstance);
  }
}
