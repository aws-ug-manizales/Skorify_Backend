import {
  GetTournamentByIdParam,
  GetTournamentByIdUsecase,
  GottenTournamentDomainEvent,
  NotGottenTournamentDomainEvent,
  TournamentContract,
} from "@skorify/domain/tournament";
import { DomainEvent } from "@skorify/domain/core";

export class GetTournamentByIdUsecaseImpl extends GetTournamentByIdUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }

  async call(param: GetTournamentByIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;

    const tournament = await this.tournamentContract.getById(tournamentId);

    if (!tournament) {
      return NotGottenTournamentDomainEvent();
    }
    return GottenTournamentDomainEvent(tournament);
  }
}
