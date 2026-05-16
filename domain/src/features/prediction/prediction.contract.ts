import { BaseContract } from '../../core';
import { PredictionEntity } from './prediction.entity';

export abstract class PredictionContract {
  abstract getById(id: string): Promise<PredictionEntity | null>;
  abstract getByUserAndMatch(userId: string, matchId: string): Promise<PredictionEntity | null>;
  abstract save(prediction: PredictionEntity): Promise<PredictionEntity | null>;
  abstract filter(filters: any): Promise<PredictionEntity[]>;
}