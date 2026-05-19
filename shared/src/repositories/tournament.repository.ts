import { TournamentAttributes, TournamentEntity } from '@skorify/domain/tournament';
import { BaseRepository, DataSource } from '../core';
import { TournamentMapper } from '../mappers/tournament.mapper';

export class TournamentRepository extends BaseRepository<TournamentEntity, TournamentAttributes> {
  constructor(ds: DataSource<TournamentEntity>, mapper: TournamentMapper) {
    super(ds, mapper);
  }
}
