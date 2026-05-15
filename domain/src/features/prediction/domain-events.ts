import { DomainEventKind } from '../../core';
import { PredictionEntity } from './prediction.entity';

export const BasicDomainEvent = DomainEventKind('BasicDomainEvent');

export const GottenPredictionsByMatchDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByMatchDomainEvent',
);
export const GottenPredictionsByUserDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByUserDomainEvent',
);
