import { DomainEvent } from '@skorify/domain/core';
import { TeamAttributes, TeamEntity } from '@skorify/domain/team';
import { BaseMapper } from '../core/base.mapper';

export class TeamMapper extends BaseMapper<TeamAttributes> {
  fromJson(json: Record<string, any>): DomainEvent  {
    return TeamEntity.build({
      id: json.id,
      name: json.name,
      shieldUrl: json.shieldUrl,
    });
  }

  toJson(entity: TeamEntity): TeamAttributes {
    return {
      id: entity.id,
      name: entity.name,
      shieldUrl: entity.shieldUrl,
    };
  }
}
