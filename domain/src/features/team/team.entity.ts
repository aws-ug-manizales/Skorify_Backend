import { Entity, Id } from "../../core/entity";

export class TeamEntity extends Entity {
  name: string;
  
  private constructor(id: Id, name: string) {
    super(id);
    this.name = name;
  }
  
  build(params: { name: string }): TeamEntity {
    return new TeamEntity(this.id, params.name);
  }
}
