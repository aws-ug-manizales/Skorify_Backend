import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
export declare class TeamGoalsRule implements PredictionRule {
    private ruleScore;
    getRuleScore(): number;
    getRuleName(): string;
    calculateScore(context: PredictionRuleContext): number;
}
