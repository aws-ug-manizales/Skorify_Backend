import { TournamentEntity } from "@skorify/domain/tournament";
import { BaseRepository, DataSource } from "../core";

export class TournamentRepository extends BaseRepository<TournamentEntity> {
  constructor(ds: DataSource<TournamentEntity>) {
    super(ds);
  }
}
