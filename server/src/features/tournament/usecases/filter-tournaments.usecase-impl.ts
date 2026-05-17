import { DomainEvent } from '@skorify/domain/core';
import {
    FilteredTournamentsDomainEvent,
    FilterTournamentsParam,
    FilterTournamentsUsecase,
    TournamentContract,
} from '@skorify/domain/tournament';

export class FilterTournamentsUsecaseImpl extends FilterTournamentsUsecase {
	constructor(private tournamentContract: TournamentContract) {
		super();
	}
	async call(param: FilterTournamentsParam): Promise<DomainEvent> {
		const tournaments = await this.tournamentContract.filter({
            where: { name: param.name },
        });
		return FilteredTournamentsDomainEvent(tournaments);
	}
}
