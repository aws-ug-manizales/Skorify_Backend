import {
  GetTeamByIdParam,
  GetTeamByIdUsecase,
  GottenTeamDomainEvent,
  NotGottenTeamDomainEvent,
  TeamContract
} from "@skorify/domain/team";
import { DomainEvent } from "@skorify/domain/core";

export class GetTeamByIdUsecaseImpl extends GetTeamByIdUsecase {
  constructor(private teamContract: TeamContract) {
    super();
  }

  async call(param: GetTeamByIdParam): Promise<DomainEvent> {
    const { teamId } = param;

    const team = await this.teamContract.getById(teamId);

    if (!team) {
      return NotGottenTeamDomainEvent();
    }
    
    return GottenTeamDomainEvent(team);
  }
}
