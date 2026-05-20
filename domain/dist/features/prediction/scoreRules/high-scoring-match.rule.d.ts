import { PredictionRule, PredictionRuleContext } from "../prediction.rule";
export declare class HighScoringMatchRule implements PredictionRule {
    private ruleScore;
    private threshold;
    getRuleScore(): number;
    getRuleName(): string;
    calculateScore(context: PredictionRuleContext): number;
    private isHighScoringMatch;
}
