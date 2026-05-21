import { DomainEvent, Like } from '@skorify/domain/core';
import {
  GetTeamsByQueryParam,
  GetTeamsByQueryUsecase,
  GottenTeamsDomainEvent,
  TeamContract,
} from '@skorify/domain/team';

export class GetTeamsByQueryUsecaseImpl extends GetTeamsByQueryUsecase {
  constructor(private teamContract: TeamContract) {
    super();
  }

  async call(param: GetTeamsByQueryParam): Promise<DomainEvent> {
    const { query } = param;

    const teams = await this.teamContract.filter({
      where: {
        name: Like(`%${query}%`),
      },
    });

    return GottenTeamsDomainEvent(teams);
  }
}
