import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import {
  CreateTournamentParam,
  CreateTournamentUsecase,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from '@skorify/domain/tournament';

export class CreateTournamentUsecaseImpl extends CreateTournamentUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }

  async call(param: CreateTournamentParam): Promise<DomainEvent> {
    const { endDate, name, startDate, matchType } = param;

    const tournamentDE = TournamentEntity.build({
      endDate,
      id: crypto.randomUUID(),
      name,
      startDate,
      matchType,
      token: crypto.randomUUID(),
    });

    if (tournamentDE.isNot(BuiltEntityDomainEvent)) {
      return tournamentDE;
    }

    const tournament = tournamentDE.payload;
    const saved = await this.tournamentContract.save(tournament);

    if (!saved) {
      return TournamentNotSavedDomainEvent();
    }

    return TournamentSavedDomainEvent(saved);
  }
}
