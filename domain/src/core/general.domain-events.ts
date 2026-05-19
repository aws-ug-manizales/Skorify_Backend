import { DomainEventKind } from "./domain-event";
import { Entity } from "./entity";

export const EntityNotInstanciableDomainEvent = DomainEventKind('EntityNotInstanciableDomainEvent');
export const BuiltEntityDomainEvent = DomainEventKind<Entity>('BuiltEntityDomainEvent');
