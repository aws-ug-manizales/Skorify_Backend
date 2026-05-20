import { DomainEvent, Entity, Id } from '../../core';
export declare enum MatchType {
    SingleMatchPerRound = "single_match_per_round",
    HomeAndAwayPerRound = "home_and_away_per_round"
}
export interface TournamentAttributes {
    id: Id;
    name: string;
    startDate: Date;
    endDate: Date;
    matchType: MatchType;
    token: string;
}
export declare class TournamentEntity extends Entity {
    name: string;
    startDate: Date;
    endDate: Date;
    matchType: MatchType;
    token: string;
    private constructor();
    static build(params: TournamentAttributes): DomainEvent;
}
