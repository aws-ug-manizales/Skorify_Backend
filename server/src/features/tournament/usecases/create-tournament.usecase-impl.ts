import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import {
  CreateTournamentParam,
  CreateTournamentUsecase,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from '@skorify/domain/tournament';
import { CreateTournamentInstanceUsecase, TournamentInstanceWithSameNameDomainEvent } from '@skorify/domain/tournament-instance';

export class CreateTournamentUsecaseImpl extends CreateTournamentUsecase {
  constructor(
    private tournamentContract: TournamentContract,
    private createTournamentInstanceUsecase: CreateTournamentInstanceUsecase,
  ) {
    super();
  }

  async call(param: CreateTournamentParam): Promise<DomainEvent> {
    const { endDate, name, startDate, matchType } = param;

    const tournamentDE = TournamentEntity.build({
      endDate,
      id: crypto.randomUUID(),
      name,
      startDate,
      matchType: matchType ?? 'single_match_per_round',
      token: crypto.randomUUID(),
      createdAt: new Date(),
    });

    if (tournamentDE.isNot(BuiltEntityDomainEvent)) {
      return tournamentDE;
    }

    const tournament = tournamentDE.payload;
    const saved = await this.tournamentContract.save(tournament);

    if (!saved) {
      return TournamentNotSavedDomainEvent();
    }

    const tournamentInstanceDE = await this.createTournamentInstanceUsecase.call({
      name: this.getGlobalInstanceName(tournament.name),
      tournamentId: saved.id,
      ownerId: null as any,
    });

    if (tournamentInstanceDE.is(TournamentInstanceWithSameNameDomainEvent)) {
      await this.tournamentContract.delete(tournament.id)
      return tournamentInstanceDE;
    }

    return TournamentSavedDomainEvent(saved);
  }

  getGlobalInstanceName(tournamentName: string): string {
    return `${tournamentName}-Global`
  }
}
