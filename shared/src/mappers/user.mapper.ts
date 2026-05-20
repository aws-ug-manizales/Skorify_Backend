import { DomainEvent } from '@skorify/domain/core';
import { UserEntity } from '@skorify/domain/user';
import { UserAttributes } from '../../../domain/dist/features/user/user.entity';
import { BaseMapper } from '../core/base.mapper';

export class UserMapper extends BaseMapper<UserAttributes> {
  fromJson(json: Record<string, any>): DomainEvent {
    return UserEntity.build({
      id: json.id,
      name: json.name,
      isActive: json.isActive,
      notificationToken: json.notificationToken,
      email: json.email,
      createdAt:  new Date(json.createdAt) ,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
      deletedAt: json.deletedAt ? new Date(json.deletedAt) : undefined,
    });
  }

  toJson(entity: UserEntity): UserAttributes {
    return {
      id: entity.id,
      name: entity.name,
      isActive: entity.isActive,
      notificationToken: entity.notificationToken,
      email: entity.email,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
