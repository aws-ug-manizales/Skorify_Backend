import { DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import { MatchStatus } from './match.state';
export type MatchStage = 'group' | 'finals';
export interface MatchAttributes {
    id: Id;
    homeTeamId: Id;
    awayTeamId: Id;
    tournamentId: Id;
    kickOff: Date;
    homeScore?: number;
    awayScore?: number;
    status?: MatchStatus;
    stage?: MatchStage;
    venue?: string | null;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
export declare class MatchEntity extends Entity {
    tournamentId: Id;
    awayTeamId: Id;
    homeTeamId: Id;
    kickOff: Date;
    awayScore?: number;
    homeScore?: number;
    stage?: MatchStage;
    venue?: string | null;
    private _status;
    private _state;
    private _timeToCloseInMinutes;
    private constructor();
    static build(params: MatchAttributes): DomainEvent;
    get status(): MatchStatus;
    set status(value: MatchStatus);
    get timeToCloseInMinutes(): number;
    canBet(): boolean;
    canEdit(): boolean;
    canChangeTeams(hasPredictions: boolean): boolean;
    isMatchClose(): boolean;
    setScores(awayScore: number, homeScore: number): void;
}
