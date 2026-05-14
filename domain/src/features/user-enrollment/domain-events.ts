import { DomainEventKind } from "../../core";
import { UserEnrollmentEntity } from "./user-enrollment.entity";

// params no corresponden con lo esperado
export const UserEnrollmentParamsNotValidDomainEvent = DomainEventKind(
  "UserEnrollmentParamsNotValidDomainEvent",
);

// Domain events related to got a user enrollment by id
export const NotGottenUserEnrollmentDomainEvent = DomainEventKind(
  "NotGottenUserEnrollmentDomainEvent",
);

// Domain events related to got all user enrollments by userId
export const NotGottenUserEnrollmentsDomainEvent = DomainEventKind(
  "NotGottenUserEnrollmentsDomainEvent",
);

export const GottenUserEnrollmentsDomainEvent = DomainEventKind<UserEnrollmentEntity[]>(
  "GottenUserEnrollmentsDomainEvent",
);

export const GottenUserEnrollmentDomainEvent = DomainEventKind<UserEnrollmentEntity>(
  "GottenUserEnrollmentDomainEvent",
);

export const UserEnrollmentAlreadyExistsDomainEvent = DomainEventKind<{
  userEnrollmentId: UserEnrollmentEntity["id"];
}>(
  "UserEnrollmentAlreadyExistsDomainEvent",
);

// Domain events related to instanciating a user enrollment entity.
export const UserEnrollmentEntityNotInstanciableDomainEvent = DomainEventKind(
  "UserEnrollmentEntityNotInstanciableDomainEvent",
);

// Domain events related to saving a user enrollment.
export const NotSavedUserEnrollmentDomainEvent = DomainEventKind(
  "NotSavedUserEnrollmentDomainEvent"
);

export const SavedUserEnrollmentDomainEvent = DomainEventKind<UserEnrollmentEntity>(
  "SavedUserEnrollmentDomainEvent"
);

