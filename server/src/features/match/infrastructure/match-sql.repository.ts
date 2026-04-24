import { MatchContract, MatchEntity } from "@skorify/domain/match";
import { PredictionEntity } from "@skorify/domain/prediction";
import { DBClient, Prediction as PredictionDbEntity } from "skorifydata";
import { MatchMapper } from "./match.mapper";
import { PredictionMapper } from "../../prediction/infrastructure/prediction.mapper";

export class MatchSqlRepository extends MatchContract {
  constructor(private db: DBClient) {
    super();
  }

  async getById(id: string): Promise<MatchEntity | null> {
    const record = await this.db.matches.findById(id);
    if (!record) return null;
    return MatchMapper.toDomain(record);
  }

  async save(match: MatchEntity): Promise<MatchEntity | null> {
    const persistenceData = MatchMapper.toPersistence(match);
    const saved = await this.db.matches.create(persistenceData);
    return MatchMapper.toDomain(saved);
  }

  async getPredictionsByMatchId(matchId: string): Promise<PredictionEntity[] | null> {
    // Como DBClient no expone un PredictionService directo aún, usamos el dataSource
    const repo = (this.db as any).dataSource.getRepository("Prediction");
    const records: PredictionDbEntity[] = await repo.find({
      where: { match_id: matchId },
    });

    return records.map((r) => PredictionMapper.toDomain(r));
  }

  // Métodos de BaseContract no implementados para este ejemplo rápido
  deleteById(id: string): Promise<MatchEntity | null> { throw new Error("Not implemented"); }
  modifyById(id: string, entity: MatchEntity): Promise<MatchEntity | null> { throw new Error("Not implemented"); }
  getAll(): Promise<MatchEntity[]> { throw new Error("Not implemented"); }
  getByIDs(ids: string[]): Promise<MatchEntity[]> { throw new Error("Not implemented"); }
  filter(filters: any): Promise<MatchEntity[]> { throw new Error("Not implemented"); }
}
