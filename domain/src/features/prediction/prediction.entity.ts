import { Entity, Id } from "../../core/entity";
import { ExactScoreRule } from "./scoreRules";
import {
  PredictionRuleBreakdown,
  PredictionScoreResult,
  PredictionScoreRuleset,
} from "./scoreRules/prediction-score.ruleset";

export class PredictionEntity extends Entity {
  userEnrollmentId: Id;
  matchId: Id;
  tournamentInstanceId : Id;
  awayScore: number;
  homeScore: number;
  earnedPoints: number;
  hasExactResult: boolean;

  private constructor(
    id: Id,
    userEnrollmentId: Id,
    matchId: Id,
    tournamentInstanceId: Id,
    awayScore: number,
    homeScore: number,
    hasExactResult: boolean,
  ) {
    super(id, new Date());
    this.userEnrollmentId = userEnrollmentId;
    this.matchId = matchId;
    this.tournamentInstanceId = tournamentInstanceId;
    this.awayScore = awayScore;
    this.homeScore = homeScore;
    this.earnedPoints = 0;
    this.hasExactResult = hasExactResult;
  }

  static build(params: {
    id: Id;
    userEnrollmentId: Id;
    matchId: Id;
    tournamentInstanceId: Id;
    awayScore: number;
    homeScore: number;
    hasExactResult: boolean;
  }): PredictionEntity {
    return new PredictionEntity(
      params.id,
      params.userEnrollmentId,
      params.matchId,
      params.tournamentInstanceId,
      params.awayScore,
      params.homeScore,
      params.hasExactResult,
    );
  }

  calculateScore(
    matchAwayScore: number,
    matchHomeScore: number,
    streakBonusPoints: number,
  ): PredictionScoreResult {
    const ruleset = PredictionScoreRuleset.default();

    const result = ruleset.calculateWithBreakdown({
      prediction: {
        awayScore: this.awayScore,
        homeScore: this.homeScore,
      },
      match: {
        awayScore: matchAwayScore,
        homeScore: matchHomeScore,
      },
    });

    this.setHasExactResult(result.breakdown)
    this.earnedPoints = result.total + streakBonusPoints;

    return result;
  }

  private setHasExactResult(rulesApplied: PredictionRuleBreakdown[]) {
    this.hasExactResult = !!rulesApplied.find(r => r.rule == ExactScoreRule.name)
  }
}
