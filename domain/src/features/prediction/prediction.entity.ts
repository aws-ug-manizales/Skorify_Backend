import { Entity, Id } from "../../core/entity";
import { ExactScoreRule } from "./scoreRules";
import { PredictionRuleBreakdown, PredictionScoreResult, PredictionScoreRuleset } from "./scoreRules/prediction-score.ruleset";

export class PredictionEntity extends Entity {
  userId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
  score: number;
  isExactScore: boolean;

  private constructor(id: Id, userId: Id, matchId: Id, awayTeamScore: number, localTeamScore: number) {
    super(id);
    this.userId = userId;
    this.matchId = matchId;
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
    this.score = 0;
    this.isExactScore = false;
  }

  static build(params: { id: Id; userId: Id; matchId: Id; awayTeamScore: number; localTeamScore: number }): PredictionEntity {
    return new PredictionEntity(params.id, params.userId, params.matchId, params.awayTeamScore, params.localTeamScore);
  }

  calculateScore(awayTeamScore: number, localTeamScore: number): PredictionScoreResult {
    const ruleset = PredictionScoreRuleset.default();

    const result = ruleset.calculateWithBreakdown({
      prediction: {
        awayTeamScore: this.awayTeamScore,
        localTeamScore: this.localTeamScore,
      },
      match: {
        awayTeamScore,
        localTeamScore,
      },
    });

    this.score = result.total;
    this.isExactScore = this.hasExactScore(result.breakdown);

    return result;
  }


  hasExactScore(breakdown: PredictionRuleBreakdown[]): boolean {
    return !!breakdown.find(b => { 
      return b.rule === ExactScoreRule.name;
    });
  }

}
