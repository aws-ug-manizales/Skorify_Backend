import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import {
  CreateTournamentParam,
  CreateTournamentUsecase,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from '@skorify/domain/tournament';
import {
  CreateTournamentInstanceUsecase,
  TournamentInstanceWithSameNameDomainEvent,
} from '@skorify/domain/tournament-instance';
import { GetUserByIdUsecase, GottenUserDomainEvent } from '@skorify/domain/user';

export class CreateTournamentUsecaseImpl extends CreateTournamentUsecase {
  constructor(
    private tournamentContract: TournamentContract,
    private createTournamentInstanceUsecase: CreateTournamentInstanceUsecase,
    private getUserByIdUsecase: GetUserByIdUsecase,
  ) {
    super();
  }

  async call(param: CreateTournamentParam): Promise<DomainEvent> {
    const { endDate: endDateSTR, name, startDate: startDateSTR, matchType, userId } = param;

    const ownerDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (ownerDE.isNot(GottenUserDomainEvent)) {
      return ownerDE;
    }
    
    const tournamentDE = TournamentEntity.build({
      endDate: new Date(endDateSTR),
      id: crypto.randomUUID(),
      name,
      startDate: new Date(startDateSTR),
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
      ownerId: userId,
    });

    if (tournamentInstanceDE.is(TournamentInstanceWithSameNameDomainEvent)) {
      await this.tournamentContract.delete(tournament.id);
      return tournamentInstanceDE;
    }

    return TournamentSavedDomainEvent(saved);
  }

  getGlobalInstanceName(tournamentName: string): string {
    return `${tournamentName}-Global`;
  }
}
