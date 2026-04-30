import { Entity, Id } from "../../core/entity";

export interface TeamAttributes {
  id: Id;
  name: string;
  shieldUrl?: string;
}

export class TeamEntity extends Entity {
  name: string;
  shieldUrl?: string;

  private constructor(params: TeamAttributes) {
    super(params.id, new Date());
    this.name = params.name;
    this.shieldUrl = params.shieldUrl;
  }

  build(params: TeamAttributes): TeamEntity | null{
    return new TeamEntity(params);
  }
}
