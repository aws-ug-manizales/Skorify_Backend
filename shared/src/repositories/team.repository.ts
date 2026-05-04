import { TeamEntity } from "@skorify/domain/team";
import { BaseRepository, DataSource } from "../core";

export class TeamRepository extends BaseRepository<TeamEntity> {
  constructor(ds: DataSource<TeamEntity>) {
    super(ds);
  }
}
