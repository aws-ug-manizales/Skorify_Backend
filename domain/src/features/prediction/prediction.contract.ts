import { PredictionEntity } from "./prediction.entity";

export abstract class PredictionContract {
  abstract getById(id: string): Promise<PredictionEntity | null>;
  abstract save(prediction: PredictionEntity): Promise<PredictionEntity | null>;
}
