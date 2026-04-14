import { MatchEntity } from "./match.entity";
import { PredictionEntity } from "../prediction/prediction.entity";
import { BaseContract } from "@/core";

export abstract class MatchContract extends BaseContract<MatchEntity> {
  abstract getPredictionsByMatchId(matchId: string): Promise<PredictionEntity[] | null>;
}
