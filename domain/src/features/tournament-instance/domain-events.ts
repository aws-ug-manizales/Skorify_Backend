import { DomainEventKind } from "../../core";
import { TournamentInstanceEntity } from "./tournament-instance.entity";

export const EntityNotInstanciableDomainEvent = DomainEventKind(
  "EntityNotInstanciableDomainEvent",
);
export const TournamentInstanceWithSameNameDomainEvent = DomainEventKind<
  TournamentInstanceEntity[]
>("TournamentInstanceWithSameNameDomainEvent");

export const GottenTournamentInstancesDomainEvent = DomainEventKind<
  TournamentInstanceEntity[]
>("GottenTournamentInstancesDomainEvent");
// Domain events related to saving a tournament instance.
export const TournamentInstanceSavedDomainEvent = DomainEventKind(
  "TournamentInstanceSavedDomainEvent",
);
export const TournamentInstanceNotSavedDomainEvent = DomainEventKind(
  "TournamentInstanceNotSavedDomainEvent",
);

// Domain events related to got a tournament instance
export const NotGottenTournamentInstanceDomainEvent = DomainEventKind(
  "NotGottenTournamentInstanceDomainEvent",
);
export const GottenTournamentInstanceDomainEvent = DomainEventKind<
  TournamentInstanceEntity
>("GottenTournamentInstanceDomainEvent");
