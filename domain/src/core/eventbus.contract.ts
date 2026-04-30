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
  handler: (domainEvents: DomainEvent[]) => void;
}

export abstract class EventBusContract {
  abstract send<T>(configuration: SentConfiguration<T>): void;
  abstract group(configuration: GroupConfiguration): void;
  abstract afterGroupCompletion<T>(
    configuration: GroupCompletionConfiguration<T>,
  ): void;
}
