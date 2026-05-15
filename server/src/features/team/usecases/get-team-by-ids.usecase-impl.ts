import {
  GetTeamByIdsParam,
  GetTeamByIdsUsecase,
  GottenTeamsDomainEvent,
  TeamContract,
} from "@skorify/domain/team";
import { DomainEvent } from "@skorify/domain/core";

export class GetTeamByIdsUsecaseImpl extends GetTeamByIdsUsecase {
  constructor(private teamContract: TeamContract) {
    super();
  }

  async call(param: GetTeamByIdsParam): Promise<DomainEvent> {
    const { teamIds } = param;

    const teams = await this.teamContract.filter({
      id: {
        in: teamIds,
      },
    });

    return GottenTeamsDomainEvent(teams);
  }
}
