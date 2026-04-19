import { Entity, Id } from "../../core/entity";

export class UserEntity extends Entity {
  name: string;
  
  private constructor(id: Id, name: string) {
    super(id);
    this.name = name;
  }
  
  static build(params: { id: Id; name: string }): UserEntity {
    return new UserEntity(params.id, params.name);
  }
}
