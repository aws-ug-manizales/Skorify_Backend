import { Id } from "../../../../core";
import { MatchStatus } from "../../match.state";

export interface CreateMatchParam {
  tournamentId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
}
