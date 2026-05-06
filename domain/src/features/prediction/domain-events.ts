import { DomainEventKind } from "../../core";
import { PredictionEntity } from "./prediction.entity";

export const BasicDomainEvent = DomainEventKind("BasicDomainEvent");

export const GottenPredictionsDomainEvent = DomainEventKind<PredictionEntity[]>(
  "GottenPredictionsDomainEvent",
);
