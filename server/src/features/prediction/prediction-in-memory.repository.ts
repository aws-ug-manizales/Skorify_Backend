import { MatchEntity } from "@skorify/domain/match";
import { PredictionContract, PredictionEntity } from "@skorify/domain/prediction";


const prediction = PredictionEntity.build({
  id: "3feb69ea-d146-4964-a007-233eb36dac82",
  userId: "3feb69ea-d146-4964-a007-233eb36dac82",
  matchId: "3feb69ea-d146-4964-a007-233eb36dac82",
  awayTeamScore: 2,
  localTeamScore: 1,
});

const prediction1 = PredictionEntity.build({
  id: "3feb69ea-d146-4964-a007-233eb36dac82",
  userId: "3feb69ea-d146-4964-a007-233eb36dac82",
  matchId: "3feb69ea-d146-4964-a007-233eb36dac82",
  awayTeamScore: 4,
  localTeamScore: 2,
});

const prediction2 = PredictionEntity.build({
  id: "3feb69ea-d146-4964-a007-233eb36dac83",
  userId: "3feb69ea-d146-4964-a007-233eb36dac83",
  matchId: "3feb69ea-d146-4964-a007-233eb36dac83",
  localTeamScore: 2,
  awayTeamScore: 4,
});

export class PredictionInMemoryRepository extends PredictionContract {

  static predictions: PredictionEntity[] = [
    prediction,
    prediction1,
    prediction2
  ];
  constructor() {
    super();
  }

  async getById(id: string): Promise<PredictionEntity | null> {
    const response = PredictionInMemoryRepository.predictions.find((p) => p.id == id);

    if (!response) {
      return null;
    }
    return response;
  }
  save(pred: PredictionEntity): Promise<PredictionEntity | null> {
    const predictionExists = PredictionInMemoryRepository.predictions.find((p) => p.id == pred.id);
    if (predictionExists) {
      // remove and update
      PredictionInMemoryRepository.predictions = PredictionInMemoryRepository.predictions.filter((p) => p.id != pred.id);
      PredictionInMemoryRepository.predictions.push(pred);
      return Promise.resolve(pred);
    }
    PredictionInMemoryRepository.predictions.push(pred);
    return Promise.resolve(pred);
  }


}
