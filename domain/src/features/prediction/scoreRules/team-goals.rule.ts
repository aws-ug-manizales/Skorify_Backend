import { PredictionRule, PredictionRuleContext } from "../prediction.rule";

export class TeamGoalsRule implements PredictionRule {
    private ruleScore = 1;

    getRuleScore(): number {
        return this.ruleScore;
    }

    getRuleName(): string {
        return TeamGoalsRule.name
    }

    calculateScore(context: PredictionRuleContext): number {
        let score = 0;

        if (context.prediction.awayScore === context.match.awayScore
            || context.prediction.homeScore === context.match.homeScore
        ) {
            score += this.ruleScore;
        }

        return score;
    }
}
