import { DomainEvent } from '@skorify/domain/core';
import {
  GetPredictionRulesParam,
  GetPredictionRulesUsecase,
  GottenPredictionRulesDomainEvent,
  PredictionScoreRuleset,
} from '@skorify/domain/prediction';

export class GetPredictionRulesUsecaseImpl extends GetPredictionRulesUsecase {
  constructor() {
    super();
  }

  async call(_param: GetPredictionRulesParam): Promise<DomainEvent> {
    const rules = PredictionScoreRuleset.default().getRules();
    return GottenPredictionRulesDomainEvent(rules);
  }
}
