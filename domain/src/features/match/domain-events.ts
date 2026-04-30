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

export const MatchTeamDoesNotExistDomainEvent = DomainEventKind(
  "MatchTeamDoesNotExistDomainEvent",
);

export const MatchTeamIsTheSameDomainEvent = DomainEventKind(
  "MatchTeamIsTheSameDomainEvent",
);

export const MatchDoesNotExistDomainEvent = DomainEventKind(
  "MatchDoesNotExistDomainEvent",
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

export const MatchCannotBeBetedDomainEvent = DomainEventKind(
  "MatchCannotBeBetedDomainEvent",
);

export const MatchEditedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchEditedDomainEvent",
);

export const MatchCannotBeEditedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotBeEditedDomainEvent",
);

export const MatchCannotChangeTeamsDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotChangeTeamsDomainEvent",
);

export const MatchCannotBeSavedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotBeSavedDomainEvent",
);

