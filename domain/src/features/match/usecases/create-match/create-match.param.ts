import { MatchStage } from "../../match.entity";

export interface CreateMatchParam {
  homeTeamId: string;
  awayTeamId: string;
  tournamentId: string;
  kickOff: Date;
  stage?: MatchStage;
  venue?: string;
}
