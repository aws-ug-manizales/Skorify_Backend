import { DomainEventKind } from "../../core";
import { PredictionEntity } from "./prediction.entity";

export const BasicDomainEvent = DomainEventKind("BasicDomainEvent");
export const UserNotActiveDomainEvent = DomainEventKind("UserNotActiveDomainEvent");
export const UserAlreadyPredictedDomainEvent = DomainEventKind("UserAlreadyPredictedDomainEvent");
export const PredictionNotCreatedDomainEvent = DomainEventKind("PredictionNotCreatedDomainEvent");
export const PredictionCreatedDomainEvent = DomainEventKind<PredictionEntity>("PredictionCreatedDomainEvent");
export const MatchBetabilityCheckedDomainEvent = DomainEventKind<{ canBet: boolean }>("MatchBetabilityCheckedDomainEvent");

export const GottenPredictionsByMatchDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByMatchDomainEvent',
);
export const GottenPredictionsByUserDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByUserDomainEvent',
);
