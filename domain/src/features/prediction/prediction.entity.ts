import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import {
  PredictionScoreResult,
  PredictionScoreRuleset,
} from './scoreRules/prediction-score.ruleset';

export interface PredictionAttributes {
  id: Id;
  userId: Id;
  instancePlayerId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
  score: number;
}

export class PredictionEntity extends Entity {
  userId: Id;
  instancePlayerId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
  score: number;

  private constructor(
    id: Id,
    userId: Id,
    instancePlayerId: Id,
    matchId: Id,
    awayTeamScore: number,
    localTeamScore: number,
  ) {
    super(id, new Date());
    this.userId = userId;
    this.instancePlayerId = instancePlayerId;
    this.matchId = matchId;
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
    this.score = 0;
  }

  static build(params: PredictionAttributes): DomainEvent {
    return BuiltEntityDomainEvent(
      new PredictionEntity(
        params.id,
        params.userId,
        params.instancePlayerId,
        params.matchId,
        params.awayTeamScore,
        params.localTeamScore,
      ),
    );
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
