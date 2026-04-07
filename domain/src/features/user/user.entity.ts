import { Entity, Id } from "../../core/entity";

export class UserEntity extends Entity {
  name: string;
  
  private constructor(id: Id, name: string) {
    super(id);
    this.name = name;
  }
  
  build(params: { name: string }): UserEntity {
    return new UserEntity(this.id, params.name);
  }
}
