import { DomainEventKind } from '../../core';
import { PredictionEntity } from './prediction.entity';

export const UserNotActiveDomainEvent = DomainEventKind('UserNotActiveDomainEvent');
export const UserAlreadyPredictedDomainEvent = DomainEventKind('UserAlreadyPredictedDomainEvent');
export const PredictionNotCreatedDomainEvent = DomainEventKind('PredictionNotCreatedDomainEvent');
export const PredictionCreatedDomainEvent = DomainEventKind<PredictionEntity>(
  'PredictionCreatedDomainEvent',
);
export const MatchBetabilityCheckedDomainEvent = DomainEventKind<{ canBet: boolean }>(
  'MatchBetabilityCheckedDomainEvent',
);

export const GottenPredictionsByMatchDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByMatchDomainEvent',
);
export const GottenPredictionsByUserDomainEvent = DomainEventKind<PredictionEntity[]>(
  'GottenPredictionsByUserDomainEvent',
);

export const NotGottenPredictionDomainEvent = DomainEventKind('NotGottenPredictionDomainEvent');
export const GottenPredictionDomainEvent = DomainEventKind<PredictionEntity>(
  'GottenPredictionDomainEvent',
);

export const PassedPredictionWindowDomainEvent = DomainEventKind(
  'PassedPredictionWindowDomainEvent',
);

export const PredictionEditedDomainEvent = DomainEventKind<PredictionEntity>(
  'PredictionEditedDomainEvent',
);

export const NotEditedPredictionDomainEvent = DomainEventKind('NotEditedPredictionDomainEvent');
