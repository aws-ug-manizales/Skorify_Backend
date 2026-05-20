import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
export declare class ExactScoreRule implements PredictionRule {
    private ruleScore;
    getRuleScore(): number;
    getRuleName(): string;
    calculateScore(context: PredictionRuleContext): number;
}
