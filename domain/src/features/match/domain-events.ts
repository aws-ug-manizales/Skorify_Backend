import { DomainEventKind } from "../../core";
import { MatchEntity } from "./match.entity";

// Domain events for the Match feature
export const EntityNotInstanciableDomainEvent = DomainEventKind(
  "EntityNotInstanciableDomainEvent",
);

// Domain events related to integrity checks
export const MatchAlreadyExistsInSameTournamentStageDomainEvent = DomainEventKind(
  "MatchAlreadyExistsInSameTournamentStageDomainEvent",
);

export const InvalidMatchStatusOnCreateDomainEvent = DomainEventKind(
  "InvalidMatchStatusOnCreateDomainEvent",
);

// Domain events related to saving a match
export const MatchNotSavedDomainEvent = DomainEventKind(
  "MatchNotSavedDomainEvent",
);
export const MatchSavedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchSavedDomainEvent",
);

// Domain events related to got a match
export const NotGottenMatchDomainEvent = DomainEventKind(
  "NotGottenMatchDomainEvent",
);
export const GottenMatchDomainEvent = DomainEventKind<MatchEntity>(
  "GottenMatchDomainEvent",
);