import { Entity, Id } from "../../core/entity";

export interface MatchEntity extends Entity {
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
}
