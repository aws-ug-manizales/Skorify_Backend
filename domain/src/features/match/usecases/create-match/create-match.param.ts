import { MatchStage } from "../../match.entity";
import { Id } from "../../../../core/entity";

export interface CreateMatchParam {
  homeTeamId: Id;
  awayTeamId: Id;
  tournamentId: Id;
  kickOff: Date;
  stage?: MatchStage;
  venue?: string;
}
