import { MatchEntity } from "@skorify/domain/match";
import { BaseRepository, DataSource } from "../core";

export class MatchRepository extends BaseRepository<MatchEntity> {
  constructor(ds: DataSource<MatchEntity>) {
    super(ds);
  }
}
