import { MatchStatus } from "../../match.entity";

export interface EditMatchParam {
  matchId: string;
  awayTeamId: string;
  localTeamId: string;
  initialTime: Date;
  status: MatchStatus;
  awayTeamScore: number;
  localTeamScore: number;
}