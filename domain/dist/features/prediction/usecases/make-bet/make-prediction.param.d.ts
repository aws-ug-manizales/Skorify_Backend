import { Id } from "../../../../core";
export interface MakePredictionParam {
    userId: Id;
    tournamentInstanceId: Id;
    matchId: Id;
    awayScore: number;
    homeScore: number;
}
