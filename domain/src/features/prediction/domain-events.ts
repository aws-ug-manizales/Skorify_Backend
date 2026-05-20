import { DomainEventKind } from '../../core';
import { PredictionScoringConfig, PredictionEntity } from './prediction.entity';
import { PredictionScoreResult } from './scoreRules/prediction-score.ruleset';

export const BasicDomainEvent = DomainEventKind("BasicDomainEvent");

export const GottenPredictionsDomainEvent = DomainEventKind<PredictionEntity[]>(
  "GottenPredictionsDomainEvent",
);

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

export const GottenPredictionRulesDomainEvent = DomainEventKind<PredictionScoringConfig>('GottenPredictionRulesDomainEvent');
export const SimulatedPredictionDomainEvent = DomainEventKind<PredictionScoreResult>('SimulatedPredictionDomainEvent');
