import { Entity, Id } from "../../core";

export interface TournamentInstanceAttributes {
  id: Id;
  name: string;
  state: "active" | "inactive" | "supended" | "terminated";
}

export class TournamentInstanceEntity extends Entity {
  name: string;
  state: "active" | "inactive" | "supended" | "terminated";

  private constructor(attributes: TournamentInstanceAttributes) {
    const { id, name, state } = attributes;
    super(id);
    this.name = name;
    this.state = state;
  }

  static build(
    params: TournamentInstanceAttributes,
  ): TournamentInstanceEntity | null {
    return new TournamentInstanceEntity(params);
  }
}
