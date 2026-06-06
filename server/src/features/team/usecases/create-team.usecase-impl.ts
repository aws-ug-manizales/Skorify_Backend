import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import {
  CreateTeamParam,
  CreateTeamUsecase,
  TeamContract,
  TeamEntity,
  TeamNotSavedDomainEvent,
  TeamSavedDomainEvent,
  TeamWithThatNameAlreadyExistsDomainEvent,
} from '@skorify/domain/team';
import { GetTournamentByIdUsecase, GottenTournamentDomainEvent } from '@skorify/domain/tournament';

export class CreateTeamUsecaseImpl extends CreateTeamUsecase {
  constructor(
    private teamContract: TeamContract,
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,
  ) {
    super();
  }
  async call(param: CreateTeamParam): Promise<DomainEvent> {
    const { name, tournamentId } = param;

    const tournamentDE = await this.getTournamentByIdUsecase.call({
      tournamentId,
    });
    if (tournamentDE.isNot(GottenTournamentDomainEvent)) {
      return tournamentDE;
    }

    const teams = await this.teamContract.filter({
      where: {
        name,
        tournamentId,
      },
    });

    if (teams.length) {
      return TeamWithThatNameAlreadyExistsDomainEvent(teams[0]);
    }

    const teamDE = TeamEntity.build({
      id: crypto.randomUUID(),
      name,
      tournamentId,
      createdAt: new Date(),
    });

    if (teamDE.isNot(BuiltEntityDomainEvent)) {
      return teamDE;
    }

    const team = teamDE.payload;
    const saved = await this.teamContract.save(team);
    if (!saved) {
      return TeamNotSavedDomainEvent();
    }

    return TeamSavedDomainEvent(saved);
  }
}
