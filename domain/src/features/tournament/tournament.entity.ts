import { Entity, Id } from "../../core";

export interface TournamentAttributes {
  id: Id;
  name: string;
  startDate: Date;
  endDate: Date;
  token: string;
}

export class TournamentEntity extends Entity {
  name: string;
  startDate: Date;
  endDate: Date;
  token: string;

  private constructor(attributes: TournamentAttributes) {
    const { id, name, startDate, endDate, token } = attributes;
    super(id);
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.token = token;
  }

  static build(params: TournamentAttributes): TournamentEntity | null {
    return new TournamentEntity(params);
  }
}
