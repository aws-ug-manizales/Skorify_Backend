import { MatchAttributes, MatchEntity } from '@skorify/domain/match';
import { BaseRepository, DataSource } from '../core';
import { MatchMapper } from '../mappers/match.mapper';

export class MatchRepository extends BaseRepository<MatchEntity, MatchAttributes> {
  constructor(ds: DataSource<MatchEntity>, mapper: MatchMapper) {
    super(ds, mapper);
  }
}
