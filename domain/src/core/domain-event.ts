export type EventName = `${string}DomainEvent`;

export interface BaseDomainEventKind {
  eventName: EventName;
}
export interface DomainEventKind extends BaseDomainEventKind {
  (): DomainEvent;
}
export interface DomainEventKindWithPayload<
  T extends unknown,
> extends BaseDomainEventKind {
  (payload: T): DomainEvent<T>;
}

export function DomainEventKind<T extends any = undefined>(
  eventName: EventName,
) {
  const evk = function (
    payload: T extends undefined ? (T extends boolean ? T : undefined) : T,
  ) {
    return new DomainEvent<T>(eventName, payload as T);
  } as T extends undefined
    ? T extends boolean
      ? DomainEventKindWithPayload<T>
      : DomainEventKind
    : DomainEventKindWithPayload<T>;

  const evkClone = Object.assign({}, evk); // Clonar el objeto
  (evk as any).eventName = eventName; // Modificar la copia

  return evk;
}

export class DomainEvent<T extends unknown = any> {
  id: Symbol;

  constructor(
    public eventName: EventName,
    public payload: T,
  ) {
    this.id = this.makeId();
  }

  private makeId() {
    return Symbol();
  }

  // is(other: BaseDomainEventKind | BaseDomainEventKind[]) {
  // 	const toEvaluate = Array.isArray(other) ? other : [other];
  // 	return toEvaluate.filter((x) => x.eventName === this.eventName).length > 0;
  // }

  is<T>(
    other: BaseDomainEventKind | BaseDomainEventKind[],
  ): this is DomainEvent<T> {
    const toEvaluate = Array.isArray(other) ? other : [other];
    return toEvaluate.some((x) => x.eventName === this.eventName);
  }
  isNot(other: BaseDomainEventKind) {
    return this.eventName !== other.eventName;
  }
}
