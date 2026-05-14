import {
  DomainEvent,
  DomainEventKind,
  DomainEventKindWithPayload,
} from "./domain-event";

export interface SentConfiguration<T = any> {
  domainEvent: DomainEventKind | DomainEventKindWithPayload<T>;
  groupId?: string;
  payload: T;
}

export interface GroupConfiguration {
  groupId: string;
  amount: number;
}

export interface GroupCompletionConfiguration<T> {
  domainEvent: DomainEventKind | DomainEventKindWithPayload<T>;
  completionHandler: (domainEvent: DomainEvent) => boolean;
  handler: (domainEvents: DomainEvent[]) => void | Promise<void>;
}

export type EventHandler<T = any> = (domainEvent: DomainEvent<T>) => void | Promise<void>;

export abstract class EventBusContract {
  abstract send<T>(configuration: SentConfiguration<T>): void | Promise<void>;
  abstract group(configuration: GroupConfiguration): void | Promise<void>;
  abstract afterGroupCompletion<T>(
    configuration: GroupCompletionConfiguration<T>,
  ): void | Promise<void>;
  abstract on<T>(
    domainEvent: DomainEventKind | DomainEventKindWithPayload<T>,
    handler: EventHandler<T>,
  ): void | Promise<void>;
}
