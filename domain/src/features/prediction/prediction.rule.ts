export type PredictionRuleContext = {
  prediction: {
    awayScore: number;
    homeScore: number;
  };
  match: {
    awayScore: number;
    homeScore: number;
  };
};

export interface PredictionRule {
  calculateScore(context: PredictionRuleContext): number;
  getRuleScore(): number;
  getRuleName(): string;
}