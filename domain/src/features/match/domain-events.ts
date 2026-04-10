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
