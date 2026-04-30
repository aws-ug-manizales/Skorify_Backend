import { DomainEventKind } from "../../core";
import { TournamentInstanceEntity } from "../tournament-instance";
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

export const NotEditedMatchDomainEvent = DomainEventKind<MatchEntity>(
  "NotEditedMatchDomainEvent",
);

export const MatchCannotBeSavedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchCannotBeSavedDomainEvent",
);

export const ClosedMatchDomainEvent = DomainEventKind<MatchEntity>(
  "ClosedMatchDomainEvent",
);

export const ReactiveClosedMatchDomainEvent = DomainEventKind<{
  match: MatchEntity;
  tournamentInstance: TournamentInstanceEntity;
}>("ClosedMatchDomainEvent");

export const MatchHasNotFinishedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchHasNotFinishedDomainEvent",
);
export const MatchAlreadyClosedDomainEvent = DomainEventKind<MatchEntity>(
  "MatchAlreadyClosedDomainEvent",
);
