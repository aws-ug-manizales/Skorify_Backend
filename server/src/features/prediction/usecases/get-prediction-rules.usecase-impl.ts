import { DomainEvent } from '@skorify/domain/core';
import {
  GetPredictionRulesParam,
  GetPredictionRulesUsecase,
  GottenPredictionRulesDomainEvent,
  PredictionScoreRuleset,
  PredictionScoringConfig,
} from '@skorify/domain/prediction';

import { UserEnrollmentEntity } from '@skorify/domain/user-enrollment';

export class GetPredictionRulesUsecaseImpl extends GetPredictionRulesUsecase {
  constructor() {
    super();
  }

  async call(_param: GetPredictionRulesParam): Promise<DomainEvent> {
    const rules = PredictionScoreRuleset.default().getRules();

    const bonus = UserEnrollmentEntity.getStreakBonusRules()

    const predictionScoringConfig: PredictionScoringConfig = {
      rules,
      streakBonusRules: Object.fromEntries(bonus)
    }

    return GottenPredictionRulesDomainEvent(predictionScoringConfig);
  }
}
