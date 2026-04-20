import { Entity, Id } from "../../core/entity";
import { PredictionScoreResult, PredictionScoreRuleset } from "./scoreRules/prediction-score.ruleset";

export class PredictionEntity extends Entity {
  userId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
  score: number;

  private constructor(id: Id, userId: Id, matchId: Id, awayTeamScore: number, localTeamScore: number) {
    super(id);
    this.userId = userId;
    this.matchId = matchId;
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
    this.score = 0;
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

    return result;
  }

}
