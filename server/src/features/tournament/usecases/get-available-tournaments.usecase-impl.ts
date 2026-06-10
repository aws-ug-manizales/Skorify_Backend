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
import { logger, serializeError } from '../../../config/logger';

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

  async call(_: GetAvailableTournamentsParam): Promise<DomainEvent> {
    logger.info('Getting available tournaments');
    const tournaments = await this.tournamentContract.getAll();
    const activeTournaments = tournaments;

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
          logger.error('Error getting global tournament instance', {
            tournamentId: tournament.id,
            error: serializeError(error),
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
