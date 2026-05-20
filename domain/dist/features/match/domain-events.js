"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GottenMatchesByTournamentDomainEvent = exports.MatchAlreadyClosedDomainEvent = exports.MatchHasNotFinishedDomainEvent = exports.ReactiveClosedMatchDomainEvent = exports.ClosedMatchesDomainEvent = exports.ClosedMatchDomainEvent = exports.MatchCannotBeSavedDomainEvent = exports.NotEditedMatchDomainEvent = exports.MatchEditedDomainEvent = exports.MatchCannotChangeTeamsDomainEvent = exports.MatchCannotBeEditedDomainEvent = exports.MatchCannotBeBetedDomainEvent = exports.GottenMatchDomainEvent = exports.NotGottenMatchDomainEvent = exports.MatchSavedDomainEvent = exports.MatchNotSavedDomainEvent = exports.MatchDoesNotExistDomainEvent = exports.MatchTeamIsTheSameDomainEvent = exports.MatchTeamDoesNotExistDomainEvent = exports.MatchAlreadyExistsInSameTournamentStageDomainEvent = void 0;
const core_1 = require("../../core");
// Domain events for the Match feature
// Domain events related to integrity checks
exports.MatchAlreadyExistsInSameTournamentStageDomainEvent = (0, core_1.DomainEventKind)('MatchAlreadyExistsInSameTournamentStageDomainEvent');
exports.MatchTeamDoesNotExistDomainEvent = (0, core_1.DomainEventKind)('MatchTeamDoesNotExistDomainEvent');
exports.MatchTeamIsTheSameDomainEvent = (0, core_1.DomainEventKind)('MatchTeamIsTheSameDomainEvent');
exports.MatchDoesNotExistDomainEvent = (0, core_1.DomainEventKind)('MatchDoesNotExistDomainEvent');
// Domain events related to saving a match
exports.MatchNotSavedDomainEvent = (0, core_1.DomainEventKind)('MatchNotSavedDomainEvent');
exports.MatchSavedDomainEvent = (0, core_1.DomainEventKind)('MatchSavedDomainEvent');
// Domain events related to got a match
exports.NotGottenMatchDomainEvent = (0, core_1.DomainEventKind)('NotGottenMatchDomainEvent');
exports.GottenMatchDomainEvent = (0, core_1.DomainEventKind)('GottenMatchDomainEvent');
exports.MatchCannotBeBetedDomainEvent = (0, core_1.DomainEventKind)('MatchCannotBeBetedDomainEvent');
exports.MatchCannotBeEditedDomainEvent = (0, core_1.DomainEventKind)('MatchCannotBeEditedDomainEvent');
exports.MatchCannotChangeTeamsDomainEvent = (0, core_1.DomainEventKind)('MatchCannotChangeTeamsDomainEvent');
exports.MatchEditedDomainEvent = (0, core_1.DomainEventKind)('MatchEditedDomainEvent');
exports.NotEditedMatchDomainEvent = (0, core_1.DomainEventKind)('NotEditedMatchDomainEvent');
exports.MatchCannotBeSavedDomainEvent = (0, core_1.DomainEventKind)('MatchCannotBeSavedDomainEvent');
exports.ClosedMatchDomainEvent = (0, core_1.DomainEventKind)('ClosedMatchDomainEvent');
exports.ClosedMatchesDomainEvent = (0, core_1.DomainEventKind)('ClosedMatchesDomainEvent');
exports.ReactiveClosedMatchDomainEvent = (0, core_1.DomainEventKind)('ClosedMatchDomainEvent');
exports.MatchHasNotFinishedDomainEvent = (0, core_1.DomainEventKind)('MatchHasNotFinishedDomainEvent');
exports.MatchAlreadyClosedDomainEvent = (0, core_1.DomainEventKind)('MatchAlreadyClosedDomainEvent');
exports.GottenMatchesByTournamentDomainEvent = (0, core_1.DomainEventKind)('GottenMatchesByTournamentDomainEvent');
