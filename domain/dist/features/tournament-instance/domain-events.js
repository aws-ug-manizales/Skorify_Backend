"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GottenTournamentInstanceDomainEvent = exports.NotGottenTournamentInstanceDomainEvent = exports.TournamentInstanceNotSavedDomainEvent = exports.TournamentInstanceSavedDomainEvent = exports.GottenTournamentInstancesDomainEvent = exports.TournamentInstanceWithSameNameDomainEvent = exports.EntityNotInstanciableDomainEvent = exports.NotGottenTournamentInstanceCurrentRankingDomainEvent = exports.GottenTournamentInstanceCurrentRankingDomainEvent = void 0;
const core_1 = require("../../core");
// Get Current Ranking domain events
exports.GottenTournamentInstanceCurrentRankingDomainEvent = (0, core_1.DomainEventKind)("GottenTournamentInstanceCurrentRankingDomainEvent");
exports.NotGottenTournamentInstanceCurrentRankingDomainEvent = (0, core_1.DomainEventKind)("NotGottenTournamentInstanceCurrentRankingDomainEvent");
// Domain events related to getting tournament instances.
exports.EntityNotInstanciableDomainEvent = (0, core_1.DomainEventKind)('EntityNotInstanciableDomainEvent');
exports.TournamentInstanceWithSameNameDomainEvent = (0, core_1.DomainEventKind)('TournamentInstanceWithSameNameDomainEvent');
exports.GottenTournamentInstancesDomainEvent = (0, core_1.DomainEventKind)('GottenTournamentInstancesDomainEvent');
// Domain events related to saving a tournament instance.
exports.TournamentInstanceSavedDomainEvent = (0, core_1.DomainEventKind)('TournamentInstanceSavedDomainEvent');
exports.TournamentInstanceNotSavedDomainEvent = (0, core_1.DomainEventKind)('TournamentInstanceNotSavedDomainEvent');
// Domain events related to got a tournament instance
exports.NotGottenTournamentInstanceDomainEvent = (0, core_1.DomainEventKind)('NotGottenTournamentInstanceDomainEvent');
exports.GottenTournamentInstanceDomainEvent = (0, core_1.DomainEventKind)('GottenTournamentInstanceDomainEvent');
