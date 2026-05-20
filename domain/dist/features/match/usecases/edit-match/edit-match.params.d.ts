import { Id } from "../../../../core/entity";
import { MatchStatus } from "../../match.state";
export interface EditMatchParam {
    matchId: Id;
    awayTeamId: Id;
    homeTeamId: Id;
    date: Date;
    status: MatchStatus;
}
