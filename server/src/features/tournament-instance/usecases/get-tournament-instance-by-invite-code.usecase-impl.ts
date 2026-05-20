import { DomainEvent, Filters } from '@skorify/domain/core';
import {
  GetTournamentInstanceByInviteCodeParam,
  GetTournamentInstanceByInviteCodeUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';

export class GetTournamentInstanceByInviteCodeUsecaseImpl extends GetTournamentInstanceByInviteCodeUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetTournamentInstanceByInviteCodeParam): Promise<DomainEvent> {
    const { inviteCode, state } = param;
    const cleanedInviteCode = inviteCode.trim().toUpperCase();

    if (!cleanedInviteCode) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    const filters: Filters = {
      where: { inviteCode: cleanedInviteCode },
    };
    if (state) {
      filters.where = {
        ...filters.where,
        state,
      };
    }
    const tournamentInstances = await this.tournamentInstanceContract.filter(filters);

    if (!tournamentInstances.length) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    return GottenTournamentInstanceDomainEvent(tournamentInstances[0]);
  }
}
