import { DomainEventKind } from "../../core";
import { MatchEntity } from "./match.entity";

export const MatchDoesNotExistDomainEvent = DomainEventKind(
  "MatchDoesNotExistDomainEvent",
);

export const GottenMatchDomainEvent = DomainEventKind<MatchEntity>(
  "GottenMatchDomainEvent",
);

export const MatchCannotBeBetedDomainEvent = DomainEventKind(
  "MatchCannotBeBetedDomainEvent",
);

export const MatchCannotBeEditedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotBeEditedDomainEvent",
);

export const MatchCannotChangeTeamsDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotChangeTeamsDomainEvent",
);

export const MatchEditedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchEditedDomainEvent",
);

