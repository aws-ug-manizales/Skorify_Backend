import { MatchContract, MatchEntity } from "@skorify/domain/match";
import { PredictionEntity } from "@skorify/domain/prediction";
import { PredictionInMemoryRepository } from "src/features/prediction/prediction-in-memory.repository";

const match = MatchEntity.build({
  id: "3feb69ea-d146-4964-a007-233eb36dac82",
  localTeamId: "local-team-id",
  awayTeamId: "away-team-id",
  date: new Date("2027-10-15T15:00:00Z"),
});


export class MatchInMemoryRepository extends MatchContract {
  matches: MatchEntity[] = [
    match
  ];
 
  constructor() {
    super();
  }

  async getById(id: string): Promise<MatchEntity | null> {
    return this.matches.find((m) => m.id == id) || null;
  }

  async save(match: MatchEntity): Promise<MatchEntity | null> {
    const matchIndex = this.matches.findIndex((m) => m.id == match.id);
    if (matchIndex >= 0) {
      this.matches[matchIndex] = match;
      return Promise.resolve(match);
    }
    this.matches.push(match);
    return Promise.resolve(match);
  }

  async deleteById(id: string): Promise<MatchEntity | null> {
    const matchIndex = this.matches.findIndex((m) => m.id == id);
    if (matchIndex < 0) {
      return null;
    }
    const [deleted] = this.matches.splice(matchIndex, 1);
    return deleted;
  }

  async modifyById(id: string, entity: MatchEntity): Promise<MatchEntity | null> {
    const matchIndex = this.matches.findIndex((m) => m.id == id);
    if (matchIndex < 0) {
      return null;
    }
    this.matches[matchIndex] = entity;
    return entity;
  }

  async getAll(): Promise<MatchEntity[]> {
    return [...this.matches];
  }

  async getByIDs(ids: string[]): Promise<MatchEntity[]> {
    return this.matches.filter((m) => ids.includes(m.id));
  }

  async filter(filters: any): Promise<MatchEntity[]> {
    return this.matches;
  }

  async getPredictionsByMatchId(matchId: string): Promise<PredictionEntity[] | null> {
    return PredictionInMemoryRepository.predictions.filter((p) => p.matchId === matchId);
  }
}
