import {
  CreateTournamentParam,
  CreateTournamentUsecase,
  EntityNotInstanciableDomainEvent,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from "@skorify/domain/tournament";
import { DomainEvent } from "@skorify/domain/core";

export class CreateTournamentUsecaseImpl extends CreateTournamentUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }

  async call(param: CreateTournamentParam): Promise<DomainEvent> {
    const { endDate, name, startDate } = param;

    const tournament = TournamentEntity.build({
      endDate,
      id: crypto.randomUUID(),
      name,
      startDate,
      token: crypto.randomUUID(),
    });

    if (!tournament) {
      return EntityNotInstanciableDomainEvent();
    }

    const saved = await this.tournamentContract.save(tournament);

    if (!saved) {
      return TournamentNotSavedDomainEvent();
    }

    return TournamentSavedDomainEvent(saved);
  }
}
