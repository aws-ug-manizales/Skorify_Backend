import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
import { ExactScoreRule } from "./exact-score.rule";
import { HighScoringMatchRule } from "./high-scoring-match.rule";
import { InverseResultRule } from "./inverse-result.rule";
import { TeamGoalsRule } from "./team-goals.rule";
import { WinnerDrawRule } from "./winner-draw.rule";

export type PredictionRuleBreakdown = {
  rule: string;
  points: number;
};

export type PredictionScoreResult = {
  total: number;
  breakdown: PredictionRuleBreakdown[];
};

export class PredictionScoreRuleset {
  private readonly rules: PredictionRule[];

  private constructor(rules: PredictionRule[]) {
    this.rules = rules;
  }

  static default(): PredictionScoreRuleset {
    return new PredictionScoreRuleset([
      new WinnerDrawRule(),
      new TeamGoalsRule(),
      new ExactScoreRule(),
      new HighScoringMatchRule(),
      new InverseResultRule(),
    ]);
  }


  calculateWithBreakdown(context: PredictionRuleContext): PredictionScoreResult {
    const breakdown: PredictionRuleBreakdown[] = this.rules
      .map((rule) => {
        const points = rule.calculateScore(context);
        return {
          rule: rule.constructor.name,
          points,
        };
      })
      .filter((item) => item.points > 0);

    const total = breakdown.reduce((sum, item) => sum + item.points, 0);

    return {
      total,
      breakdown,
    };
  }
}
