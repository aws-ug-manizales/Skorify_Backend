import { BaseRepository, DataSource } from "../core";
import { TournamentInstanceEntity } from "@skorify/domain/tournament-instance";

export class TournamentInstanceRepository extends BaseRepository<TournamentInstanceEntity> {
  constructor(ds: DataSource<TournamentInstanceEntity>) {
    super(ds);
  }
}
