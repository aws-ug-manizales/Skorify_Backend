import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import { ExactScoreRule } from './scoreRules';
import {
  PredictionRuleBreakdown,
  PredictionScoreResult,
  PredictionScoreRuleset,
} from './scoreRules/prediction-score.ruleset';

export interface PredictionAttributes {
  id: Id;
  userId: Id;
  userEnrollmentId: Id;
  tournamentInstanceId: Id;
  matchId: Id;
  awayScore: number;
  homeScore: number;
  score: number;
  earnedPoints: number;
  hasExactResult: boolean;
}

export class PredictionEntity extends Entity {
  userId: Id;
  userEnrollmentId: Id;
  tournamentInstanceId: Id;
  matchId: Id;
  awayScore: number;
  homeScore: number;
  score: number;
  earnedPoints: number;
  hasExactResult: boolean;

  private constructor(attributes: PredictionAttributes) {
    super(attributes.id, new Date());
    this.userId = attributes.userId;
    this.userEnrollmentId = attributes.userEnrollmentId;
    this.tournamentInstanceId = attributes.tournamentInstanceId;
    this.matchId = attributes.matchId;
    this.awayScore = attributes.awayScore;
    this.homeScore = attributes.homeScore;
    this.earnedPoints = attributes.earnedPoints ?? 0;
    this.hasExactResult = attributes.hasExactResult;
    this.score = attributes.score;
  }

  static build(params: PredictionAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new PredictionEntity(params));
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

    this.setHasExactResult(result.breakdown);
    this.earnedPoints = result.total + streakBonusPoints;

    return result;
  }

  private setHasExactResult(rulesApplied: PredictionRuleBreakdown[]) {
    this.hasExactResult = !!rulesApplied.find((r) => r.rule == ExactScoreRule.name);
  }
}
