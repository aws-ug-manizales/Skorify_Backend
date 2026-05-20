import { DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import { PredictionScoreResult, Rule } from './scoreRules/prediction-score.ruleset';
export interface StreakBonusConfig {
    key: number;
    value: number;
}
export interface PredictionScoringConfig {
    rules: Rule[];
    streakBonusRules: StreakBonusConfig[];
}
export interface PredictionAttributes {
    id: Id;
    userId: Id;
    userEnrollmentId: Id;
    tournamentInstanceId: Id;
    matchId: Id;
    awayScore: number;
    homeScore: number;
    earnedPoints: number;
    hasExactResult: boolean;
}
export interface SimulationPredictionAttribute {
    awayScore: number;
    homeScore: number;
}
export declare class PredictionEntity extends Entity {
    userId: Id;
    userEnrollmentId: Id;
    tournamentInstanceId: Id;
    matchId: Id;
    awayScore: number;
    homeScore: number;
    earnedPoints: number;
    hasExactResult: boolean;
    private constructor();
    static build(params: PredictionAttributes): DomainEvent;
    static forSimulation(params: SimulationPredictionAttribute): PredictionEntity;
    calculateScore(matchAwayScore: number, matchHomeScore: number, streakBonusPoints: number): PredictionScoreResult;
    private setHasExactResult;
    private static generateEmptyId;
}
