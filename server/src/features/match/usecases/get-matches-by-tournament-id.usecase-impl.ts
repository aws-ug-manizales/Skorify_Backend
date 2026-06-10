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

    if (!matches.length) {
      return GottenMatchesByTournamentDomainEvent([]);
    }
    const teamIds = matches.map((match) => [match.awayTeamId, match.homeTeamId]).flat();
    const uniqueTeamIds = [...new Set(teamIds)];

    const teamsDE = await this.getTeamByIdsUsecase.call({ teamIds: uniqueTeamIds });

    const teams: TeamEntity[] = teamsDE.payload;
    const teamsMap = new Map<string, TeamEntity>(teams.map((team) => [team.id, team]));
    const response = matches.map((match) => {
      const awayTeam = teamsMap.get(match.awayTeamId)!;
      const homeTeam = teamsMap.get(match.homeTeamId)!;
      return { match, awayTeam, homeTeam };
    });
    return GottenMatchesByTournamentDomainEvent(response);
  }
}
