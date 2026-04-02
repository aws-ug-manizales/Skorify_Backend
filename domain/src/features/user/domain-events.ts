import { DomainEventKind } from "../../core";
import { UserEntity } from "./user.entity";

export const NotGottenUserDomainEvent = DomainEventKind(
  "NotGottenUserDomainEvent",
);

export const GottenUserDomainEvent = DomainEventKind<UserEntity>(
  "GottenUserDomainEvent",
);
