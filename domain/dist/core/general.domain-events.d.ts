import { DomainEventKind } from "./domain-event";
import { Entity } from "./entity";
export declare const EntityNotInstanciableDomainEvent: DomainEventKind;
export declare const BuiltEntityDomainEvent: import("./domain-event").DomainEventKindWithPayload<Entity>;
