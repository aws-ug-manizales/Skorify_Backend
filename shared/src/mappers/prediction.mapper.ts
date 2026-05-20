import { DomainEvent } from '@skorify/domain/core';
import { PredictionAttributes, PredictionEntity } from '@skorify/domain/prediction';
import { BaseMapper } from '../core/base.mapper';

export class PredictionMapper extends BaseMapper<PredictionAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    return PredictionEntity.build({
      id: json.id,
      userEnrollmentId: json.userEnrollmentId,
      userId: json.userId,
      tournamentInstanceId: json.tournamentInstanceId,
      matchId: json.matchId,
      awayScore: json.awayScore,
      homeScore: json.homeScore,
      earnedPoints: json.earnedPoints ?? 0,
      hasExactResult: json.hasExactResult ?? false
    });
  }

  toJson(entity: PredictionEntity): PredictionAttributes {
    return {
      id: entity.id,
      userId: entity.userId,
      tournamentInstanceId: entity.tournamentInstanceId,
      matchId: entity.matchId,
      awayScore: entity.awayScore,
      homeScore: entity.homeScore,
      earnedPoints: entity.earnedPoints,
      hasExactResult: entity.hasExactResult,
      userEnrollmentId: entity.userEnrollmentId,
    };
  }
}
