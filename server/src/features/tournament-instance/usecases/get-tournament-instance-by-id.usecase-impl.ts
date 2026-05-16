import {
  GetTournamentInstanceByIdParam,
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';
import { DomainEvent } from '@skorify/domain/core';

export class GetTournamentInstanceByIdUsecaseImpl extends GetTournamentInstanceByIdUsecase {
  constructor(private tournamentInstanceContract: TournamentInstanceContract) {
    super();
  }

  async call(param: GetTournamentInstanceByIdParam): Promise<DomainEvent> {
    const { tournamentInstanceId } = param;

    const tournamentInstance = await this.tournamentInstanceContract.getById(tournamentInstanceId);

    if (!tournamentInstance) {
      return NotGottenTournamentInstanceDomainEvent();
    }
    return GottenTournamentInstanceDomainEvent(tournamentInstance);
  }
}
