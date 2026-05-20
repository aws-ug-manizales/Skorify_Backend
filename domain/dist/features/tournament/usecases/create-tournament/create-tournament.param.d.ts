import { MatchType } from "../../tournament.entity";
export interface CreateTournamentParam {
    name: string;
    matchType: MatchType;
    startDate: Date;
    endDate: Date;
}
