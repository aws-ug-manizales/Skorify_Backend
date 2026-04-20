import { MatchStatus } from "../../match.entity";

export interface EditMatchParam {
  matchId: string;
  awayTeamId: string;
  localTeamId: string;
  date: Date;
  status: MatchStatus;
}