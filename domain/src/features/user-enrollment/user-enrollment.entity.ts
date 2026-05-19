import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';

export interface UserEnrollmentAttributes {
  id: Id;
  userId: Id;
  tournamentInstanceId: Id;
  tournamentId: Id;
  joinedAt: Date;
  lastPosition: number;
  currentPosition: number;
  currentScore: number;
  streak: number;
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
  }

  static build(params: UserEnrollmentAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new UserEnrollmentEntity(params));
  }
}
