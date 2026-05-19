import { DomainEvent } from '@skorify/domain/core';
import { MatchAttributes, MatchEntity } from '@skorify/domain/match';
import { BaseMapper } from '../core/base.mapper';

export class MatchMapper extends BaseMapper<MatchAttributes> {
  constructor() {
    super();
  }
  fromJson(json: Record<string, any>): DomainEvent {
    return MatchEntity.build({
      id: json.id,
      tournamentId: json.tournamentId,
      homeTeamId: json.homeTeamId,
      awayTeamId: json.awayTeamId,
      kickOff: new Date(json.kickOff),
      homeTeamScore: json.homeTeamScore,
      awayTeamScore: json.awayTeamScore,
      status: json.status,
      stage: json.stage,
      venue: json.venue,
      createdAt: new Date(json.createdAt),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
      deletedAt: json.deletedAt ? new Date(json.deletedAt) : undefined,
    });
  }

  toJson(entity: MatchEntity): MatchAttributes {
    return {
      id: entity.id,
      tournamentId: entity.tournamentId,
      homeTeamId: entity.homeTeamId,
      awayTeamId: entity.awayTeamId,
      kickOff: entity.kickOff,
      homeTeamScore: entity.homeTeamScore,
      awayTeamScore: entity.awayTeamScore,
      status: entity.status,
      stage: entity.stage,
      venue: entity.venue,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
