import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
import { isExactScore, Score, totalGoals } from "./score-rule.utils";

export class HighScoringMatchRule implements PredictionRule {
  private ruleScore = 1;
  private threshold = 4;

  calculateScore(context: PredictionRuleContext): number {
    if (this.isHighScoringMatch(context.match) && isExactScore(context.prediction, context.match)) {
      return this.ruleScore;
    }

    return 0;
  }

  private isHighScoringMatch(match: Score): boolean {
    return totalGoals(match) >= this.threshold;
  }
}
