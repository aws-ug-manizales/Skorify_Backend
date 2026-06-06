import {
  ScorePredictionParam,
  ScorePredictionUsecase,
  UserEnrollmentContract,
  PredictionScoredDomainEvent,
} from '@skorify/domain/user-enrollment';
import { DomainEvent } from '@skorify/domain/core';

export class ScorePredictionUsecaseImpl extends ScorePredictionUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: ScorePredictionParam): Promise<DomainEvent> {
    const { predictionId, matchAwayScore, matchHomeScore } = param;

    const result = await this.userEnrollmentContract.scorePrediction(
      predictionId,
      matchAwayScore,
      matchHomeScore,
    );

    return PredictionScoredDomainEvent(result);
  }
}
