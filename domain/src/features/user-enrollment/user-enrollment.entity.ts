import { Entity, Id } from "../../core/entity";

export interface UserEnrollmentAttributes{
  id: Id;
  userId: Id;
  tournamentInstanceId: Id;
  joinedAt: Date;
  lastPosition: number;
  currentPosition: number;
  currentScore: number;
  streak: number;
}

export class UserEnrollmentEntity extends Entity {
  userId: Id;
  tournamentInstanceId: Id;
  joinedAt: Date;
  lastPosition: number;
  currentPosition: number;
  currentScore: number;
  streak: number;

  private constructor(attributes: UserEnrollmentAttributes) {
    const {
      id,
      userId,
      tournamentInstanceId,
      joinedAt,
      lastPosition,
      currentPosition,
      currentScore,
      streak
    } = attributes;
    super(id, new Date());
    this.userId = userId;
    this.tournamentInstanceId = tournamentInstanceId;
    this.joinedAt = joinedAt;
    this.lastPosition = lastPosition;
    this.currentPosition = currentPosition;
    this.currentScore = currentScore;
    this.streak = streak;
  }

  static build(params: UserEnrollmentAttributes): UserEnrollmentEntity {
    return new UserEnrollmentEntity(params);
  }
}