import { Entity, Id } from "../../core/entity";

export interface UserAttributes {
  id: Id;
  name: string;
  notificationToken: string;
}

export class UserEntity extends Entity {
  name: string;
  notificationToken: string;

  private constructor(attributes: UserAttributes) {
    const { id, name, notificationToken } = attributes;
    super(id);
    this.name = name;
    this.notificationToken = notificationToken;
  }

  static build(params: UserAttributes): UserEntity {
    return new UserEntity(params);
  }
}
