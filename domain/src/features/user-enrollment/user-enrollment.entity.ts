import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
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
const streakBonusRules: Map<number, number> = new Map<number, number>();

streakBonusRules.set(3, 1);
streakBonusRules.set(5, 2);
streakBonusRules.set(7, 3);
streakBonusRules.set(10, 4);
export class UserEnrollmentEntity extends Entity {
  userId: Id;
  tournamentInstanceId: Id;
  tournamentId: Id;
  joinedAt: Date;
  lastPosition: null | number;
  currentPosition: null | number;
  currentScore: number;
  streak: number;
  maxStreak: number;


  private constructor(attributes: UserEnrollmentAttributes) {
    const {
      id,
      userId,
      tournamentInstanceId,
      tournamentId,
      joinedAt,
      lastPosition,
      currentPosition,
      currentScore,
      streak,
      maxStreak,
    } = attributes;
    super(id, new Date());
    this.userId = userId;
    this.tournamentInstanceId = tournamentInstanceId;
    this.tournamentId = tournamentId;
    this.joinedAt = joinedAt;
    this.lastPosition = lastPosition;
    this.currentPosition = currentPosition;
    this.currentScore = currentScore;
    this.streak = streak;
    this.maxStreak = maxStreak;


  }

  static build(params: UserEnrollmentAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new UserEnrollmentEntity(params));
  }

  static forSimulation({ streak }: SimulationUserEnrollmentAttribute): DomainEvent {
    return BuiltEntityDomainEvent(new UserEnrollmentEntity(
      {
        id: '0-0-0-0-0',
        userId: '0-0-0-0-0',
        tournamentInstanceId: '0-0-0-0-0',
        tournamentId: '0-0-0-0-0',
        joinedAt: new Date(),
        lastPosition: null,
        currentPosition: null,
        currentScore: 0,
        streak,
        maxStreak: 0,
      },
    ));
  }

  getStreakBonusPoints(): number {
    return streakBonusRules.get(this.streak) ?? 0;
  }

  static getStreakBonusRules(): Map<number, number> {
    return streakBonusRules
  }

  applyScore(points: number, isExact: boolean): void {
    this.currentScore += points;
    if (isExact) {
      this.streak += 1;
    } else {
      this.streak = 0;
    }
    this.verifyMaxStreak()
  }

  private verifyMaxStreak(): void {
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }
  }

  private static generateEmptyId(): Id {
    return "0-0-0-0-0"
  }
}
