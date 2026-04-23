import { Entity, Id } from "../../core/entity";

export class UserEntity extends Entity {
  name: string;
  isActive: boolean;

  private constructor(id: Id, name: string, isActive: boolean) {
    super(id);
    this.name = name;
    this.isActive = isActive;
  }

  static build(params: { id: Id; name: string; isActive?: boolean }): UserEntity {
    return new UserEntity(params.id, params.name, params.isActive ?? true);
  }

  build(params: { name: string; isActive?: boolean }): UserEntity {
    return new UserEntity(this.id, params.name, params.isActive ?? this.isActive);
  }
}
