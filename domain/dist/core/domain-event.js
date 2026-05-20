"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
exports.DomainEventKind = DomainEventKind;
function DomainEventKind(eventName) {
    const evk = function (payload) {
        return new DomainEvent(eventName, payload);
    };
    const evkClone = Object.assign({}, evk); // Clonar el objeto
    evk.eventName = eventName; // Modificar la copia
    return evk;
}
class DomainEvent {
    eventName;
    payload;
    id;
    constructor(eventName, payload) {
        this.eventName = eventName;
        this.payload = payload;
        this.id = this.makeId();
    }
    makeId() {
        return Symbol();
    }
    // is(other: BaseDomainEventKind | BaseDomainEventKind[]) {
    // 	const toEvaluate = Array.isArray(other) ? other : [other];
    // 	return toEvaluate.filter((x) => x.eventName === this.eventName).length > 0;
    // }
    is(other) {
        const toEvaluate = Array.isArray(other) ? other : [other];
        return toEvaluate.some((x) => x.eventName === this.eventName);
    }
    isNot(other) {
        return this.eventName !== other.eventName;
    }
}
exports.DomainEvent = DomainEvent;
