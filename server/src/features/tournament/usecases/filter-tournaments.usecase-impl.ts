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
		const where: { name?: string } = {};
		if (param?.name) where.name = param.name;

		const tournaments = await this.tournamentContract.filter({ where });
		return FilteredTournamentsDomainEvent(tournaments);
	}
}
