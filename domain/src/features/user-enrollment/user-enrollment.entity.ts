import { Entity, Id } from "../../core/entity";

export interface UserEnrollmentAttributes{
  id: Id;
  userId: Id;
  tournamentInstanceId: Id;
  tournamentId: Id;
  joinedAt: Date;
  lastPosition: number;
  currentPosition: number;
  currentScore: number;
  streak: number;
  maxStreak: number;
}

export class UserEnrollmentEntity extends Entity {
  userId: Id;
  tournamentInstanceId: Id;
  tournamentId: Id;
  joinedAt: Date;
  lastPosition: number;
  currentPosition: number;
  currentScore: number;
  streak: number;
  maxStreak: number;
  
  private streakBonusRules: Map<number, number> = new Map<number, number>();

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
      maxStreak
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

    this.streakBonusRules.set(3, 1);
    this.streakBonusRules.set(5, 2);
    this.streakBonusRules.set(7, 3);
    this.streakBonusRules.set(10, 4);
  }

  static build(params: UserEnrollmentAttributes): UserEnrollmentEntity {
    return new UserEnrollmentEntity(params);
  }

  getStreakBonusPoints(): number{
    return this.streakBonusRules.get(this.streak) ?? 0
  }

  applyScore(points: number, isExact: boolean): void {
    this.currentScore += points;
    if (isExact) {
      this.streak += 1;
    } else {
      this.streak = 0;
    }
  }

  verifyMaxStreak(): void {
    if(this.streak > this.maxStreak){
      this.maxStreak = this.streak;
    }
  }

}