import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
import { isSameOutcome } from "./score-rule.utils";

export class WinnerDrawRule implements PredictionRule {

    private ruleScore: number = 2

    getRuleScore(): number {
        return this.ruleScore;
    }
    
    getRuleName(): string {
        return WinnerDrawRule.name
    }

    calculateScore(context: PredictionRuleContext): number {
        if (isSameOutcome(context.prediction, context.match)) {
            return this.ruleScore;
        }

        return 0;
    }
}