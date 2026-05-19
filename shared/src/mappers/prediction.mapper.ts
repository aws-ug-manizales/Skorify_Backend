import { DomainEvent } from '@skorify/domain/core';
import { PredictionAttributes, PredictionEntity } from '@skorify/domain/prediction';
import { BaseMapper } from '../core/base.mapper';

export class PredictionMapper extends BaseMapper<PredictionAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    const entity = PredictionEntity.build({
      id: json.id,
      userId: json.userId,
      instancePlayerId: json.instancePlayerId,
      matchId: json.matchId,
      awayTeamScore: json.awayTeamScore,
      localTeamScore: json.localTeamScore,
      score: json.score,
    });

    return entity;
  }

  toJson(entity: PredictionEntity): PredictionAttributes {
    return {
      id: entity.id,
      userId: entity.userId,
      instancePlayerId: entity.instancePlayerId,
      matchId: entity.matchId,
      awayTeamScore: entity.awayTeamScore,
      localTeamScore: entity.localTeamScore,
      score: entity.score,
    };
  }
}
