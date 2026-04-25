import { DomainEventKind } from "../../core";
import { TournamentEntity } from "./tournament.entity";

export const EntityNotInstanciableDomainEvent = DomainEventKind(
  "EntityNotInstanciableDomainEvent",
);
export const TournamentNotSavedDomainEvent = DomainEventKind(
  "TournamentNotSavedDomainEvent",
);
export const TournamentSavedDomainEvent = DomainEventKind<TournamentEntity>(
  "TournamentSavedDomainEvent",
);
export const GottenTournamentDomainEvent = DomainEventKind<TournamentEntity>(
  "GottenTournamentDomainEvent",
);
export const NotGottenTournamentDomainEvent = DomainEventKind(
  "NotGottenTournamentDomainEvent",
);
