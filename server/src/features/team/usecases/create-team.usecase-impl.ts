import {
  BuiltEntityDomainEvent,
  DomainEvent
} from '@skorify/domain/core';
import {
  CreateTeamParam,
  CreateTeamUsecase,
  TeamContract,
  TeamEntity,
  TeamNotSavedDomainEvent,
  TeamSavedDomainEvent,
  TeamWithThatNameAlreadyExistsDomainEvent,
} from '@skorify/domain/team';

export class CreateTeamUsecaseImpl extends CreateTeamUsecase {
  constructor(private teamContract: TeamContract) {
    super();
  }
  async call(param: CreateTeamParam): Promise<DomainEvent> {
    const { name } = param;

    const teams = await this.teamContract.filter({
      where: {
        name,
      },
    });

    if (teams.length) {
      return TeamWithThatNameAlreadyExistsDomainEvent(teams[0]);
    }

    const teamDE = TeamEntity.build({
      id: crypto.randomUUID(),
      name,
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
