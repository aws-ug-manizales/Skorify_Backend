import { DomainEventKind } from "../../core";
import { TeamEntity } from "./team.entity";

export const EntityNotInstanciableDomainEvent = DomainEventKind(
  "EntityNotInstanciableDomainEvent",
);
export const TeamSavedDomainEvent = DomainEventKind<TeamEntity>(
  "TeamSavedDomainEvent",
);
export const TeamNotSavedDomainEvent = DomainEventKind(
  "TeamNotSavedDomainEvent",
);
export const GottenTeamDomainEvent = DomainEventKind<TeamEntity>(
  "GottenTeamDomainEvent",
);
export const NotGottenTeamDomainEvent = DomainEventKind(
  "NotGottenTeamDomainEvent",
);

export const GottenTeamsDomainEvent = DomainEventKind<TeamEntity[]>(
  "GottenTeamsDomainEvent",
);
