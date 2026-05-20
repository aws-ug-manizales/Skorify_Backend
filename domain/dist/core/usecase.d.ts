import { DomainEvent } from "./domain-event";
export declare abstract class Usecase<Param> {
    abstract call(param: Param): Promise<DomainEvent>;
}
