import { Id } from "../../../../core";

export interface CreateMatchParam {
  tournamentId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
  status: "draft" | "scheduled" | "finished";
}
