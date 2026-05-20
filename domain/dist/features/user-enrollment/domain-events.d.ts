import { DomainEventKind } from '../../core';
import { UserEnrollmentEntity } from './user-enrollment.entity';
export declare const UserEnrollmentParamsNotValidDomainEvent: DomainEventKind;
export declare const NotGottenUserEnrollmentDomainEvent: DomainEventKind;
export declare const NotGottenUserEnrollmentsDomainEvent: DomainEventKind;
export declare const GottenUserEnrollmentsDomainEvent: import("../../core").DomainEventKindWithPayload<UserEnrollmentEntity[]>;
export declare const GottenUserEnrollmentDomainEvent: import("../../core").DomainEventKindWithPayload<UserEnrollmentEntity>;
export declare const UserIsInTournamentInstanceDomainEvent: import("../../core").DomainEventKindWithPayload<{
    userEnrollmentId: UserEnrollmentEntity["id"];
}>;
export declare const UserIsNotInTournamentInstanceDomainEvent: DomainEventKind;
export declare const NotSavedUserEnrollmentDomainEvent: DomainEventKind;
export declare const SavedUserEnrollmentDomainEvent: import("../../core").DomainEventKindWithPayload<UserEnrollmentEntity>;
