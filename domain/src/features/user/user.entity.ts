import { Entity, Id } from "../../core/entity";

export interface UserAttributes {
  id: Id;
  name: string;
}

export class UserEntity extends Entity {
  name: string;

  private constructor(attributes: UserAttributes) {
    const { id, name } = attributes;
    super(id);
    this.name = name;
  }

  static build(params: UserAttributes): UserEntity {
    return new UserEntity(params);
  }
}
