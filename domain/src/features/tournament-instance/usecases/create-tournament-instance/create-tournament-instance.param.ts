import { Id } from "../../../../core";

export interface CreateTournamentInstanceParam {
  tournamentId: Id;
  owner: Id;
  name: string;
}
