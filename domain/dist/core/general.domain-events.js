"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltEntityDomainEvent = exports.EntityNotInstanciableDomainEvent = void 0;
const domain_event_1 = require("./domain-event");
exports.EntityNotInstanciableDomainEvent = (0, domain_event_1.DomainEventKind)('EntityNotInstanciableDomainEvent');
exports.BuiltEntityDomainEvent = (0, domain_event_1.DomainEventKind)('BuiltEntityDomainEvent');
