import { Id } from "../../../../core";

export interface CreateMatchParam {
  tournamentInstanceId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
  status: "draft" | "scheduled" | "finished";
}
