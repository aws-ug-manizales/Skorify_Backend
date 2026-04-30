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
