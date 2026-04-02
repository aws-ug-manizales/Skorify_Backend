import { Entity, Id } from "../../core/entity";

export interface BetEntity extends Entity {
  userId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;
}
