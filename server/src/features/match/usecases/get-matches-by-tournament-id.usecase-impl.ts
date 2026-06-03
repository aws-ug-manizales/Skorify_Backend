import { DomainEvent } from '@skorify/domain/core';
import {
  GetMatchesByTournamentIdParam,
  GetMatchesByTournamentIdUsecase,
  GottenMatchesByTournamentDomainEvent,
  MatchContract,
  MatchEntity,
} from '@skorify/domain/match';

import { GetTeamByIdsUsecase, TeamEntity } from '@skorify/domain/team';

export class GetMatchesByTournamentIdUsecaseImpl extends GetMatchesByTournamentIdUsecase {
  constructor(
    private matchContract: MatchContract,
    private getTeamByIdsUsecase: GetTeamByIdsUsecase,
  ) {
    super();
  }

  async call(param: GetMatchesByTournamentIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;

    const matches: MatchEntity[] = await this.matchContract.filter({
      where: {
        tournamentId,
      },
    });

    const teamIds = matches.map((match) => [match.awayTeamId, match.homeTeamId]).flat();
    const uniqueTeamIds = [...new Set(teamIds)];

    const teamsDE = await this.getTeamByIdsUsecase.call({ teamIds: uniqueTeamIds });

    const teams: TeamEntity[] = teamsDE.payload;
    const response = matches.map((match) => {
      const awayTeam = teams.find((team) => team.id === match.awayTeamId)!;
      const homeTeam = teams.find((team) => team.id === match.homeTeamId)!;
      return { match, awayTeam, homeTeam };
    });
    return GottenMatchesByTournamentDomainEvent(response);
  }
}
