import { BaseRepository, DataSource } from "../core";
import { PredictionEntity } from "@skorify/domain/prediction";

export class PredictionRepository extends BaseRepository<PredictionEntity> {
  constructor(ds: DataSource<PredictionEntity>) {
    super(ds);
  }

  async getByMatchId(matchId: string): Promise<PredictionEntity[]> {
    const all = await this.getAll();
    return all.filter((p) => p.matchId === matchId);
  }
}
