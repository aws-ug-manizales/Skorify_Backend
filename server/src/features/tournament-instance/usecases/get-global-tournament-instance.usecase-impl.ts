import { DomainEvent } from '@skorify/domain/core';
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
      where: [
        {
          attribute: 'tournamentId',
          type: 'equals',
          value: tournamentId,
        },
        {
          attribute: 'name',
          type: 'like',
          value: '%Global',
        }
      ],
    });

    if (!globalInstance) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    return GottenTournamentInstanceDomainEvent(globalInstance);
  }
}
