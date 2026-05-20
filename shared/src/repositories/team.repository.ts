import { TeamAttributes, TeamEntity } from '@skorify/domain/team';
import { BaseRepository, DataSource } from '../core';
import { TeamMapper } from '../mappers/team.mapper';

export class TeamRepository extends BaseRepository<TeamEntity, TeamAttributes> {
  constructor(ds: DataSource<TeamEntity>, mapper: TeamMapper) {
    super(ds, mapper);
  }
}
