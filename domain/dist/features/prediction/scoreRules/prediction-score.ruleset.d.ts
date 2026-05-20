import { PredictionRuleContext } from "../prediction.rule";
export interface Rule {
    name: string;
    score: number;
}
export type PredictionRuleBreakdown = {
    rule: string;
    points: number;
};
export type PredictionScoreResult = {
    total: number;
    breakdown: PredictionRuleBreakdown[];
};
export declare class PredictionScoreRuleset {
    private readonly rules;
    private constructor();
    static default(): PredictionScoreRuleset;
    calculateWithBreakdown(context: PredictionRuleContext): PredictionScoreResult;
    getRules(): Rule[];
}
