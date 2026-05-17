import { DomainEvent } from "@skorify/domain/core";
import {
  NotGottenTournamentDomainEvent,
  TournamentContract,
  TournamentInvalidDatesDomainEvent,
  TournamentNotUpdatedDomainEvent,
  TournamentUpdatedDomainEvent,
  UpdateTournamentParam,
  UpdateTournamentUsecase,
} from "@skorify/domain/tournament";

export class UpdateTournamentUsecaseImpl extends UpdateTournamentUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }

  async call(param: UpdateTournamentParam): Promise<DomainEvent> {
    const { tournamentId, endDate, matchType, name, startDate } = param;

    if (startDate >= endDate) {
      return TournamentInvalidDatesDomainEvent();
    }

    const tournament = await this.tournamentContract.getById(tournamentId);
    if (!tournament) {
      return NotGottenTournamentDomainEvent();
    }

    tournament.name = name;
    tournament.matchType = matchType;
    tournament.startDate = startDate;
    tournament.endDate = endDate;

    const updated = await this.tournamentContract.modifyById(tournamentId, tournament);
    if (!updated) {
      return TournamentNotUpdatedDomainEvent();
    }

    return TournamentUpdatedDomainEvent(updated);
  }
}
