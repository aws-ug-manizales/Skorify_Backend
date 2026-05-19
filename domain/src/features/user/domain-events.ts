import { DomainEventKind } from "../../core";
import { UserEntity } from "./user.entity";

export const NotGottenUserDomainEvent = DomainEventKind(
  "NotGottenUserDomainEvent",
);

export const UserWithSameEmailDomainEvent = DomainEventKind(
  "UserWithSameEmailDomainEvent",
);

export const GottenUserDomainEvent = DomainEventKind<UserEntity>(
  "GottenUserDomainEvent",
);

export const NotificationTokenAssignedDomainEvent = DomainEventKind<UserEntity>(
  "NotificationTokenAssignedDomainEvent",
);

export const NotificationTokenAssignmentFailedDomainEvent = DomainEventKind(
  "NotificationTokenAssignmentFailedDomainEvent",
);

export const UserWithEmailAlreadyExistDomainEvent = DomainEventKind<UserEntity>(
  "UserWithEmailAlreadyExistDomainEvent",
);

export const UserFoundAndDeletedDomainEvent = DomainEventKind(
  "UserFoundAndDeletedDomainEvent",
);
