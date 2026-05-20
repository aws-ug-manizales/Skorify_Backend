import { DomainEvent } from '@skorify/domain/core';
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
    const inviteCode = param?.inviteCode?.trim().toUpperCase();

    if (!inviteCode) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    const matches = await this.tournamentInstanceContract.filter({
      where: { inviteCode },
    });

    if (!matches.length) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    return GottenTournamentInstanceDomainEvent(matches[0]);
  }
}
