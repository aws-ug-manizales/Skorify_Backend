import { PredictionAttributes, PredictionEntity } from '@skorify/domain/prediction';
import { BaseRepository, DataSource } from '../core';
import { PredictionMapper } from '../mappers/prediction.mapper';

export class PredictionRepository extends BaseRepository<PredictionEntity, PredictionAttributes> {
  constructor(ds: DataSource<PredictionEntity>, mapper: PredictionMapper) {
    super(ds, mapper);
  }
}
