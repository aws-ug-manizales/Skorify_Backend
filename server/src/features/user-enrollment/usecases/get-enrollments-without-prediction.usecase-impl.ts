import {
  GetEnrollmentsWithoutPredictionParam,
  GetEnrollmentsWithoutPredictionUsecase,
  UserEnrollmentContract,
  GottenUserEnrollmentsDomainEvent,
} from '@skorify/domain/user-enrollment';
import {
  GetPredictionsByMatchUsecase,
  GottenPredictionsByMatchDomainEvent,
  PredictionEntity,
} from '@skorify/domain/prediction';
import { DomainEvent, Id } from '@skorify/domain/core';

export class GetEnrollmentsWithoutPredictionUsecaseImpl extends GetEnrollmentsWithoutPredictionUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract,
    private getPredictionsByMatchUsecase: GetPredictionsByMatchUsecase,
  ) {
    super();
  }

  async call(param: GetEnrollmentsWithoutPredictionParam): Promise<DomainEvent> {
    const { matchId, tournamentInstanceId } = param;

    const predictionsDE = await this.getPredictionsByMatchUsecase.call({
      matchId: matchId as Id,
    });

    if (predictionsDE.isNot(GottenPredictionsByMatchDomainEvent)) {
      return predictionsDE;
    }

    const predictions = predictionsDE.payload as PredictionEntity[];

    const enrollmentIdsWithPrediction = new Set(predictions.map((p) => p.userEnrollmentId));

    const allEnrollments = await this.userEnrollmentContract.filter({
      where: {
        tournamentInstanceId: tournamentInstanceId,
      },
    });

    const enrollmentsWithoutPrediction = allEnrollments.filter(
      (enrollment) => !enrollmentIdsWithPrediction.has(enrollment.id),
    );

    return GottenUserEnrollmentsDomainEvent(enrollmentsWithoutPrediction);
  }
}
