import { Id } from "../../../../core";

export interface CloseMatchParam {
  matchId: Id;
  homeScore?: number;
  awayScore?: number;
}
