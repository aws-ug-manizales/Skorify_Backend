import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
import { isInverseOutcome } from "./score-rule.utils";

export class InverseResultRule implements PredictionRule {
  private ruleScore = 1;

  calculateScore(context: PredictionRuleContext): number {
    if (isInverseOutcome(context.prediction, context.match)) {
      return this.ruleScore;
    }

    return 0;
  }
}
