import { DomainEventKind } from '../../core';
import { TournamentInstanceEntity } from './tournament-instance.entity';
import { RankingItem } from './usecases/get-current-ranking/utils/ranking-item';

// Get Current Ranking domain events
export const GottenTournamentInstanceCurrentRankingDomainEvent = DomainEventKind<
  RankingItem[]
>("GottenTournamentInstanceCurrentRankingDomainEvent");

export const NotGottenTournamentInstanceCurrentRankingDomainEvent = DomainEventKind(
  "NotGottenTournamentInstanceCurrentRankingDomainEvent",
);

// Domain events related to getting tournament instances.
export const EntityNotInstanciableDomainEvent = DomainEventKind('EntityNotInstanciableDomainEvent');

export const TournamentInstanceWithSameNameDomainEvent = DomainEventKind<
  TournamentInstanceEntity[]
>('TournamentInstanceWithSameNameDomainEvent');

export const GottenTournamentInstancesDomainEvent = DomainEventKind<TournamentInstanceEntity[]>(
  'GottenTournamentInstancesDomainEvent',
);
// Domain events related to saving a tournament instance.
export const TournamentInstanceSavedDomainEvent = DomainEventKind<TournamentInstanceEntity>(
  'TournamentInstanceSavedDomainEvent',
);
export const TournamentInstanceNotSavedDomainEvent = DomainEventKind(
  'TournamentInstanceNotSavedDomainEvent',
);

// Domain events related to got a tournament instance
export const NotGottenTournamentInstanceDomainEvent = DomainEventKind(
  'NotGottenTournamentInstanceDomainEvent',
);
export const GottenTournamentInstanceDomainEvent = DomainEventKind<TournamentInstanceEntity>(
  'GottenTournamentInstanceDomainEvent',
);
