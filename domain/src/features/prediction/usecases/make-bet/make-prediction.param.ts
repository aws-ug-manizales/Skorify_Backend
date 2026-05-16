import { Id } from "../../../../core";

export interface MakePredictionParam {
  userId: Id;
  instanceId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
}
