import { DomainEvent, In } from '@skorify/domain/core';
import {
  GetTeamByIdsParam,
  GetTeamByIdsUsecase,
  GottenTeamsDomainEvent,
  TeamContract,
} from '@skorify/domain/team';

export class GetTeamByIdsUsecaseImpl extends GetTeamByIdsUsecase {
	constructor(private teamContract: TeamContract) {
		super();
	}

	async call(param: GetTeamByIdsParam): Promise<DomainEvent> {
		const {teamIds} = param;

		const teams = await this.teamContract.filter({
			where: {
				id: In(teamIds),
			},
		});

		return GottenTeamsDomainEvent(teams);
	}
}
