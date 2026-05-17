import { BaseAttributes, Entity, Id } from "../../core/entity";

export interface UserAttributes extends BaseAttributes {
  id: Id;
  name: string;
  isActive: boolean;
  notificationToken: string;
  email: string;
}

export class UserEntity extends Entity {
  name: string;
  isActive: boolean;
  notificationToken: string;
  email: string;

  private constructor(attributes: UserAttributes) {
    const { id, name, notificationToken, isActive, email } = attributes;
    super(id, new Date());
    this.name = name;
    this.isActive = isActive;
    this.notificationToken = notificationToken;
    this.email = email;
  }

  static build(params: UserAttributes): UserEntity {
    return new UserEntity(params);
  }
}
