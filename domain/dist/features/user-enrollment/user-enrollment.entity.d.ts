import { DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
export interface SimulationUserEnrollmentAttribute {
    streak: number;
}
export interface UserEnrollmentAttributes {
    id: Id;
    userId: Id;
    tournamentInstanceId: Id;
    tournamentId: Id;
    joinedAt: Date;
    lastPosition: null | number;
    currentPosition: null | number;
    currentScore: number;
    streak: number;
    maxStreak: number;
}
export declare class UserEnrollmentEntity extends Entity {
    userId: Id;
    tournamentInstanceId: Id;
    tournamentId: Id;
    joinedAt: Date;
    lastPosition: null | number;
    currentPosition: null | number;
    currentScore: number;
    streak: number;
    maxStreak: number;
    private constructor();
    static build(params: UserEnrollmentAttributes): DomainEvent;
    static forSimulation({ streak }: SimulationUserEnrollmentAttribute): DomainEvent;
    getStreakBonusPoints(): number;
    static getStreakBonusRules(): Map<number, number>;
    applyScore(points: number, isExact: boolean): void;
    private verifyMaxStreak;
    private static generateEmptyId;
}
