import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import { ExactScoreRule } from './scoreRules';
import {
  PredictionRuleBreakdown,
  PredictionScoreResult,
  PredictionScoreRuleset,
  Rule,
} from './scoreRules/prediction-score.ruleset';

export interface StreakBonusConfig {
  key: number;
  value: number;
}

export interface PredictionScoringConfig {
  rules: Rule[];
  streakBonusRules: StreakBonusConfig[];
}

export interface PredictionAttributes {
  id: Id;
  userId: Id;
  userEnrollmentId: Id;
  tournamentInstanceId: Id;
  matchId: Id;
  awayScore: number;
  homeScore: number;
  earnedPoints: number;
  hasExactResult: boolean;
}

export interface SimulationPredictionAttribute {
  awayScore: number;
  homeScore: number;
}
export class PredictionEntity extends Entity {
  userId: Id;
  userEnrollmentId: Id;
  tournamentInstanceId: Id;
  matchId: Id;
  awayScore: number;
  homeScore: number;
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
  }

  static build(params: PredictionAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new PredictionEntity(params));
  }

  static forSimulation(params: SimulationPredictionAttribute): PredictionEntity {
    return new PredictionEntity({
      id: this.generateEmptyId(),
      userId: this.generateEmptyId(),
      userEnrollmentId: this.generateEmptyId(),
      tournamentInstanceId: this.generateEmptyId(),
      matchId: this.generateEmptyId(),
      homeScore: params.homeScore,
      awayScore: params.awayScore,
      earnedPoints: 0,
      hasExactResult: false,
    });
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
    this.earnedPoints = result.total

    if (streakBonusPoints > 0 && this.hasExactResult) {
      result.breakdown.push({ points: streakBonusPoints, rule: "StreakBonusPoints" })
      this.earnedPoints += streakBonusPoints
    }

    return result;
  }

  private setHasExactResult(rulesApplied: PredictionRuleBreakdown[]) {
    this.hasExactResult = !!rulesApplied.find((r) => r.rule == ExactScoreRule.name);
  }

  private static generateEmptyId(): Id {
    return "0-0-0-0-0"
  }

}
