import {
  DomainEvent,
  DomainEventKind,
  DomainEventKindWithPayload,
} from "./domain-event";

export interface SentConfiguration<T = any> {
  domainEvent: DomainEventKind | DomainEventKindWithPayload<T>;
  payload: T;
}

export abstract class EventBusContract {
  abstract send<T>(configuration: SentConfiguration<T>): void | Promise<void>;
}
