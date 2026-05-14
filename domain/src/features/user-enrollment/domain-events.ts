import { DomainEventKind } from "../../core";
import { UserEnrollmentEntity } from "./user-enrollment.entity";

// params no corresponden con lo esperado
export const UserEnrollmentParamsNotValidDomainEvent = DomainEventKind(
  "UserEnrollmentParamsNotValidDomainEvent",
);

// Domain events related to got a user enrollment
export const NotGottenUserEnrollmentDomainEvent = DomainEventKind(
  "NotGottenUserEnrollmentDomainEvent",
);

export const GottenUserEnrollmentDomainEvent = DomainEventKind<UserEnrollmentEntity>(
  "GottenUserEnrollmentDomainEvent",
);

// Domain events related to instanciating a user enrollment entity.
export const UserEnrollmentEntityNotInstanciableDomainEvent = DomainEventKind(
  "UserEnrollmentEntityNotInstanciableDomainEvent",
);

// Domain events related to saving a user enrollment.
export const UserEnrollmentSavedDomainEvent = DomainEventKind<UserEnrollmentEntity>(
  "UserEnrollmentSavedDomainEvent"
);

export const UserEnrollmentNotSavedDomainEvent = DomainEventKind(
  "UserEnrollmentNotSavedDomainEvent"
);