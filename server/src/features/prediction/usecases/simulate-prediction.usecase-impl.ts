import { DomainEvent } from '@skorify/domain/core';
import {
  PredictionEntity,
  SimulatePredictionParam,
  SimulatePredictionUsecase,
  SimulatedPredictionDomainEvent,
} from '@skorify/domain/prediction';
import { UserEnrollmentEntity } from '@skorify/domain/user-enrollment';

export class SimulatePredictionUsecaseImpl extends SimulatePredictionUsecase {
  constructor() {
    super();
  }

  async call(param: SimulatePredictionParam): Promise<DomainEvent> {
    const { predictionHomeScore, predictionAwayScore, matchHomeScore, matchAwayScore, streak } =
      param;

    const enrollmentDE = UserEnrollmentEntity.forSimulation({ streak });
    const mockEnrollment = enrollmentDE.payload as UserEnrollmentEntity;
    const streakBonusPoints = mockEnrollment.getStreakBonusPoints();
    const prediction = PredictionEntity.forSimulation({
      homeScore: predictionHomeScore,
      awayScore: predictionAwayScore,
    });
    const result = prediction.calculateScore(matchAwayScore, matchHomeScore, streakBonusPoints);

    return SimulatedPredictionDomainEvent({
      total: prediction.earnedPoints,
      breakdown: result.breakdown,
    });
  }
}
