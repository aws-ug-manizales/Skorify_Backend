import { DomainEvent } from '@skorify/domain/core';
import {
    TournamentInstanceAttributes,
    TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';
import { BaseMapper } from '../core/base.mapper';

export class TournamentInstanceMapper extends BaseMapper<TournamentInstanceAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    const event = TournamentInstanceEntity.build({
      id: json.id,
      name: json.name,
      ownerId: json.ownerId,
      tournamentId: json.tournamentId,
      state: json.state,
    });

    return event;
  }

  toJson(entity: TournamentInstanceEntity): TournamentInstanceAttributes {
    return {
      id: entity.id,
      name: entity.name,
      ownerId: entity.ownerId,
      tournamentId: entity.tournamentId,
      state: entity.state,
    };
  }
}
