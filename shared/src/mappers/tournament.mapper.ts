import { DomainEvent } from '@skorify/domain/core';
import { TournamentAttributes, TournamentEntity } from '@skorify/domain/tournament';
import { BaseMapper } from '../core/base.mapper';

export class TournamentMapper extends BaseMapper<TournamentAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    return TournamentEntity.build({
      id: json.id,
      name: json.name,
      startDate: new Date(json.startDate),
      endDate: new Date(json.endDate),
      matchType: json.matchType,
      token: json.token,
    });
  }

  toJson(entity: TournamentEntity): TournamentAttributes {
    return {
      id: entity.id,
      name: entity.name,
      startDate: entity.startDate,
      endDate: entity.endDate,
      matchType: entity.matchType,
      token: entity.token,
    };
  }
}
