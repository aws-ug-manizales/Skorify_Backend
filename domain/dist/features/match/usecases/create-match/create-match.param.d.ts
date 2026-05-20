import { Id } from "../../../../core";
import { MatchStage } from "../../match.entity";
export interface CreateMatchParam {
    homeTeamId: Id;
    awayTeamId: Id;
    tournamentId: Id;
    kickOff: Date;
    stage?: MatchStage;
    venue?: string;
}
