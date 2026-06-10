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
import { Logger } from '@aws-lambda-powertools/logger';

type AvailableTournament = TournamentEntity & {
  globalInstanceId: string | null;
};

export class GetAvailableTournamentsUsecaseImpl extends GetAvailableTournamentsUsecase {
  constructor(
    private tournamentContract: TournamentContract,
    private getGlobalTournamentInstanceUsecase: GetGlobalTournamentInstanceUsecase,
    private logger: Logger,
  ) {
    super();
  }

  async call(_: GetAvailableTournamentsParam): Promise<DomainEvent> {
    const tournaments = await this.tournamentContract.getAll();
    const now = new Date();
    const activeTournaments = tournaments.filter((tournament) => tournament.endDate >= now);

    const availableTournaments = await Promise.all(
      activeTournaments.map(async (tournament) => {
        try {
          const globalInstanceDE = await this.getGlobalTournamentInstanceUsecase.call({
            tournamentId: tournament.id,
          });

          const globalInstanceId = globalInstanceDE.is(GottenTournamentInstanceDomainEvent)
            ? (globalInstanceDE.payload as TournamentInstanceEntity).id
            : null;

          return {
            ...tournament,
            globalInstanceId,
          } as AvailableTournament;
        } catch (error: unknown) {
          this.logger.error('No se pudo obtener la instancia global del torneo', {
            tournamentId: tournament.id,
            error,
          });

          return {
            ...tournament,
            globalInstanceId: null,
          } as AvailableTournament;
        }
      }),
    );

    return FilteredTournamentsDomainEvent(availableTournaments);
  }
}
