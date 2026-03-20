import { DomainEvent } from "./domain-event";

export abstract class Usecase<Param> {
  abstract call(param: Param): Promise<DomainEvent>;
}
