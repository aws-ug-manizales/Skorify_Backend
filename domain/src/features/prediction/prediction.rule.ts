export type PredictionRuleContext = {
  prediction: {
    awayTeamScore: number;
    localTeamScore: number;
  };
  match: {
    awayTeamScore: number;
    localTeamScore: number;
  };
};

export interface PredictionRule {
  calculateScore(context: PredictionRuleContext): number;
}