import { DomainEventKind } from '../../core';
import { TournamentEntity } from './tournament.entity';

export const EntityNotInstanciableDomainEvent = DomainEventKind('EntityNotInstanciableDomainEvent');
export const TournamentNotSavedDomainEvent = DomainEventKind('TournamentNotSavedDomainEvent');
export const TournamentSavedDomainEvent = DomainEventKind<TournamentEntity>(
	'TournamentSavedDomainEvent',
);
export const GottenTournamentDomainEvent = DomainEventKind<TournamentEntity>(
	'GottenTournamentDomainEvent',
);
export const NotGottenTournamentDomainEvent = DomainEventKind('NotGottenTournamentDomainEvent');
export const FilteredTournamentsDomainEvent = DomainEventKind<TournamentEntity[]>(
	'FilteredTournamentsDomainEvent',
);
export const TournamentNotUpdatedDomainEvent = DomainEventKind('TournamentNotUpdatedDomainEvent');
export const TournamentUpdatedDomainEvent = DomainEventKind<TournamentEntity>(
	'TournamentUpdatedDomainEvent',
);
export const TournamentInvalidDatesDomainEvent = DomainEventKind(
	'TournamentInvalidDatesDomainEvent',
);
