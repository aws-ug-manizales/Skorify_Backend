export type EventName = `${string}DomainEvent`;
export interface BaseDomainEventKind {
    eventName: EventName;
}
export interface DomainEventKind extends BaseDomainEventKind {
    (): DomainEvent;
}
export interface DomainEventKindWithPayload<T extends unknown> extends BaseDomainEventKind {
    (payload: T): DomainEvent<T>;
}
export declare function DomainEventKind<T extends any = undefined>(eventName: EventName): T extends undefined ? T extends boolean ? DomainEventKindWithPayload<T> : DomainEventKind : DomainEventKindWithPayload<T>;
export declare class DomainEvent<T extends unknown = any> {
    eventName: EventName;
    payload: T;
    id: Symbol;
    constructor(eventName: EventName, payload: T);
    private makeId;
    is<T>(other: BaseDomainEventKind | BaseDomainEventKind[]): this is DomainEvent<T>;
    isNot(other: BaseDomainEventKind): boolean;
}
