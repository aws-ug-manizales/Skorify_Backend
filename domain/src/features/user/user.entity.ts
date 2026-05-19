import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { BaseAttributes, Entity, Id } from '../../core/entity';

export interface UserAttributes extends BaseAttributes {
  id: Id;
  name: string;
  isActive: boolean;
  notificationToken: string;
  email: string;
  image?: string;
}

export class UserEntity extends Entity {
  name: string;
  isActive: boolean = false;
  notificationToken: string;
  email: string;
  image?: string;

  private constructor(attributes: UserAttributes) {
    const { id, name, notificationToken, email, image, isActive } = attributes;
    super(id, new Date());
    this.name = name;
    this.email = email;
    this.image = image;
    this.notificationToken = notificationToken;
    this.email = email;
    this.isActive = isActive;
  }

  static build(params: UserAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new UserEntity(params));
  }
}
