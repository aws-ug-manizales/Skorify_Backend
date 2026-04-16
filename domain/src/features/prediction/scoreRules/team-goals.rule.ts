import { PredictionRule, PredictionRuleContext } from "../prediction.rule";

export class TeamGoalsRule implements PredictionRule {
    private ruleScore = 1;

    calculateScore(context: PredictionRuleContext): number {
        let score = 0;

        if (context.prediction.awayTeamScore === context.match.awayTeamScore
            || context.prediction.localTeamScore === context.match.localTeamScore
        ) {
            score += this.ruleScore;
        }

        return score;
    }
}
