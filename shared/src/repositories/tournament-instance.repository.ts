import {
  TournamentInstanceAttributes,
  TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';
import { BaseRepository, DataSource } from '../core';
import { TournamentInstanceMapper } from '../mappers/tournament-instance.mapper';

export class TournamentInstanceRepository extends BaseRepository<
  TournamentInstanceEntity,
  TournamentInstanceAttributes
> {
  constructor(ds: DataSource<TournamentInstanceEntity>, mapper: TournamentInstanceMapper) {
    super(ds, mapper);
  }
}
