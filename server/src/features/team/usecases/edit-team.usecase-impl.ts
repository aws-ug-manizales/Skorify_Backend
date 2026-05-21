import { DomainEvent } from '@skorify/domain/core';
import {
  EditTeamParam,
  EditTeamUsecase,
  GetTeamByIdUsecase,
  GottenTeamDomainEvent,
  TeamContract,
  TeamEditedDomainEvent,
  TeamNotEditedDomainEvent,
} from '@skorify/domain/team';

export class EditTeamUsecaseImpl extends EditTeamUsecase {
  constructor(
    private getTeamByIdUsecase: GetTeamByIdUsecase,
    private teamContract: TeamContract,
  ) {
    super();
  }

  async call(param: EditTeamParam): Promise<DomainEvent> {
    const { teamId, name } = param;

    const teamDE = await this.getTeamByIdUsecase.call({
      teamId,
    });

    if (teamDE.isNot(GottenTeamDomainEvent)) {
      return teamDE;
    }

    const team = teamDE.payload;

    team.name = name;

    const edited = await this.teamContract.modify(team);
    if (!edited) {
      return TeamNotEditedDomainEvent();
    }

    return TeamEditedDomainEvent(edited);
  }
}
