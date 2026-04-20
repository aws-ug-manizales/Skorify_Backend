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
    const response = this.matches.find((m) => m.id == id);

    if (!response) {
      return null;
    }
    return response;
  }
  save(match: MatchEntity): Promise<MatchEntity | null> {
    const matchExists = this.matches.find((m) => m.id == match.id);
    if (matchExists) {
      return Promise.resolve(matchExists);
    }
    this.matches.push(match);
    return Promise.resolve(match);
  }

  async getPredictionsByMatchId(matchId: string): Promise<PredictionEntity[] | null> {
    return PredictionInMemoryRepository.predictions.filter((p) => p.matchId === matchId);
  }
}
