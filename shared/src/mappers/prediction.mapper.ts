import { DomainEvent } from '@skorify/domain/core';
import { PredictionAttributes, PredictionEntity } from '@skorify/domain/prediction';
import { BaseMapper } from '../core/base.mapper';

export class PredictionMapper extends BaseMapper<PredictionAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    const entity = PredictionEntity.build(json as PredictionAttributes);

    return entity;
  }

  toJson(entity: PredictionEntity): PredictionAttributes {
    return {
      id: entity.id,
      userId: entity.userId,
      tournamentInstanceId: entity.tournamentInstanceId,
      matchId: entity.matchId,
      awayScore: entity.awayScore,
      homeScore: entity.homeScore,
      score: entity.score,
      earnedPoints: entity.earnedPoints,
      hasExactResult: entity.hasExactResult,
      userEnrollmentId: entity.userEnrollmentId,
    };
  }
}
