import { Id } from "../../../../core";
import { MatchType } from "../../tournament.entity";
export interface UpdateTournamentParam {
    tournamentId: Id;
    name: string;
    matchType: MatchType;
    startDate: Date;
    endDate: Date;
}
