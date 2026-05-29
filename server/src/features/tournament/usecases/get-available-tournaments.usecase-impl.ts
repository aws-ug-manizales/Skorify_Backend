import { DomainEvent } from '@skorify/domain/core';
import {
  FilteredTournamentsDomainEvent,
  GetAvailableTournamentsParam,
  GetAvailableTournamentsUsecase,
  TournamentContract,
  TournamentEntity,
} from '@skorify/domain/tournament';
import {
  GetGlobalTournamentInstanceUsecase,
  GottenTournamentInstanceDomainEvent,
  TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';

type AvailableTournament = TournamentEntity & {
  globalInstanceId: string | null;
};

export class GetAvailableTournamentsUsecaseImpl extends GetAvailableTournamentsUsecase {
  constructor(
    private tournamentContract: TournamentContract,
    private getGlobalTournamentInstanceUsecase: GetGlobalTournamentInstanceUsecase,
  ) {
    super();
  }

  async call(param: GetAvailableTournamentsParam): Promise<DomainEvent> {
    const tournaments = await this.tournamentContract.getAll();
    const now = new Date();
    const activeTournaments = tournaments.filter(
      (tournament) =>
        tournament.startDate <= now &&
        tournament.endDate >= now,
    );

    const availableTournaments = await Promise.all(
      activeTournaments.map(async (tournament) => {
        const globalInstanceDE =
          await this.getGlobalTournamentInstanceUsecase.call({
            tournamentId: tournament.id,
          });

        const globalInstanceId = globalInstanceDE.is(
          GottenTournamentInstanceDomainEvent,
        )
          ? (globalInstanceDE.payload as TournamentInstanceEntity).id
          : null;

        return {
          ...tournament,
          globalInstanceId,
        } as AvailableTournament;
      }),
    );

    return FilteredTournamentsDomainEvent(availableTournaments);
  }
}
