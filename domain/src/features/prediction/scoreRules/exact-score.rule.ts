import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
import { isExactScore } from "./score-rule.utils";

export class ExactScoreRule implements PredictionRule {
  private ruleScore = 1;

  calculateScore(context: PredictionRuleContext): number {
    if (isExactScore(context.prediction, context.match)) {
      return this.ruleScore;
    }

    return 0;
  }
}
