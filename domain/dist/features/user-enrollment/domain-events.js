"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedUserEnrollmentDomainEvent = exports.NotSavedUserEnrollmentDomainEvent = exports.UserIsNotInTournamentInstanceDomainEvent = exports.UserIsInTournamentInstanceDomainEvent = exports.GottenUserEnrollmentDomainEvent = exports.GottenUserEnrollmentsDomainEvent = exports.NotGottenUserEnrollmentsDomainEvent = exports.NotGottenUserEnrollmentDomainEvent = exports.UserEnrollmentParamsNotValidDomainEvent = void 0;
const core_1 = require("../../core");
// params no corresponden con lo esperado
exports.UserEnrollmentParamsNotValidDomainEvent = (0, core_1.DomainEventKind)('UserEnrollmentParamsNotValidDomainEvent');
// Domain events related to got a user enrollment by id
exports.NotGottenUserEnrollmentDomainEvent = (0, core_1.DomainEventKind)('NotGottenUserEnrollmentDomainEvent');
// Domain events related to got all user enrollments by userId
exports.NotGottenUserEnrollmentsDomainEvent = (0, core_1.DomainEventKind)('NotGottenUserEnrollmentsDomainEvent');
exports.GottenUserEnrollmentsDomainEvent = (0, core_1.DomainEventKind)('GottenUserEnrollmentsDomainEvent');
exports.GottenUserEnrollmentDomainEvent = (0, core_1.DomainEventKind)('GottenUserEnrollmentDomainEvent');
exports.UserIsInTournamentInstanceDomainEvent = (0, core_1.DomainEventKind)('UserIsInTournamentInstanceDomainEvent');
exports.UserIsNotInTournamentInstanceDomainEvent = (0, core_1.DomainEventKind)('UserIsNotInTournamentInstanceDomainEvent');
// Domain events related to saving a user enrollment.
exports.NotSavedUserEnrollmentDomainEvent = (0, core_1.DomainEventKind)('NotSavedUserEnrollmentDomainEvent');
exports.SavedUserEnrollmentDomainEvent = (0, core_1.DomainEventKind)('SavedUserEnrollmentDomainEvent');
