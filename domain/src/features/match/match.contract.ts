import { MatchEntity } from "./match.entity";
import { PredictionEntity } from "../prediction/prediction.entity";

export abstract class MatchContract {
  abstract getById(id: string): Promise<MatchEntity | null>;
  abstract save(match: MatchEntity): Promise<MatchEntity | null>;
  abstract getPredictionsByMatchId(matchId: string): Promise<PredictionEntity[] | null>;
}
