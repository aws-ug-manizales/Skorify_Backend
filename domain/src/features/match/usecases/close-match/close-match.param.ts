import { Id } from "../../../../core";

export interface CloseMatchParam {
  matchId: Id;
  homeTeamScore?: number;
  awayTeamScore?: number;
}
