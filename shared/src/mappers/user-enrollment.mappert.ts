import { DomainEvent } from '@skorify/domain/core';
import { UserEnrollmentEntity } from '@skorify/domain/user-enrollment';
import { UserEnrollmentAttributes } from '../../../domain/dist/features/user-enrollment/user-enrollment.entity';
import { BaseMapper } from '../core/base.mapper';

export class UserEnrollmentMapper extends BaseMapper<UserEnrollmentAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    return UserEnrollmentEntity.build({
      id: json.id,
      userId: json.userId,
      tournamentInstanceId: json.tournamentInstanceId,
      tournamentId: json.tournamentId,
      joinedAt: new Date(json.joinedAt),
      lastPosition: json.lastPosition,
      currentPosition: json.currentPosition,
      currentScore: json.currentScore,
      streak: json.streak,
    });
  }

  toJson(entity: UserEnrollmentEntity): UserEnrollmentAttributes {
    return {
      id: entity.id,
      userId: entity.userId,
      tournamentInstanceId: entity.tournamentInstanceId,
      tournamentId: entity.tournamentId,
      joinedAt: entity.joinedAt,
      lastPosition: entity.lastPosition,
      currentPosition: entity.currentPosition,
      currentScore: entity.currentScore,
      streak: entity.streak,
    };
  }
}
