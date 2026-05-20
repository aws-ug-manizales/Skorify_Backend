import type { MatchEntity } from "./match.entity";
export declare enum MatchStatus {
    Draft = "draft",
    Scheduled = "scheduled",
    InProgress = "in_progress",
    Finished = "finished",
    Cancelled = "cancelled"
}
export interface MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare class DraftState implements MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare class ScheduledState implements MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare class InProgressState implements MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare class FinishedState implements MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare class CancelledState implements MatchState {
    canEdit(match: MatchEntity): boolean;
    canBet(match: MatchEntity): boolean;
    canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
    isMatchClose(match: MatchEntity): boolean;
}
export declare const matchStateCollection: Record<MatchStatus, MatchState>;
