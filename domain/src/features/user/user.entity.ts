import { Entity, Id } from "../../core/entity";

export interface UserAttributes {
  id: Id;
  name: string;
  isActive: boolean;
}

export class UserEntity extends Entity {
  name: string;
  isActive: boolean;

  private constructor(attributes: UserAttributes) {
    const { id, name, isActive } = attributes;
    super(id);
    this.name = name;
    this.isActive = isActive;
  }

  static build(params: UserAttributes): UserEntity {
    return new UserEntity(params);
  }
}
