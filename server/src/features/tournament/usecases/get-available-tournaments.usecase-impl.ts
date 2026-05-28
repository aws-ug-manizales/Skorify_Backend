import { DomainEvent, Like } from '@skorify/domain/core';
import {
  FilteredTournamentsDomainEvent,
  GetAvailableTournamentsParam,
  GetAvailableTournamentsUsecase,
  TournamentContract,
} from '@skorify/domain/tournament';

export class GetAvailableTournamentsUsecaseImpl extends GetAvailableTournamentsUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }
  async call(param: GetAvailableTournamentsParam): Promise<DomainEvent> {
    const tournaments = await this.tournamentContract.getAll();
    return FilteredTournamentsDomainEvent(tournaments);
  }
}
