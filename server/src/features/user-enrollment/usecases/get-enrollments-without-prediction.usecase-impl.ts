import {
  GetEnrollmentsWithoutPredictionParam,
  GetEnrollmentsWithoutPredictionUsecase,
  UserEnrollmentContract,
  GottenUserEnrollmentsDomainEvent,
} from "@skorify/domain/user-enrollment";
import { PredictionContract } from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";

export class GetEnrollmentsWithoutPredictionUsecaseImpl extends GetEnrollmentsWithoutPredictionUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract,
    private predictionContract: PredictionContract
  ) {
    super();
  }

  async call(param: GetEnrollmentsWithoutPredictionParam): Promise<DomainEvent> {
    const { matchId, tournamentInstanceId } = param;

    const predictions = await this.predictionContract.filter({
      where: {
        matchId: matchId,
      }
    });

    const enrollmentIdsWithPrediction = new Set(predictions.map(p => p.userEnrollmentId));

    const allEnrollments = await this.userEnrollmentContract.filter({
      where: {
        tournamentInstanceId: tournamentInstanceId,
      }
    });

    const enrollmentsWithoutPrediction = allEnrollments.filter(
      enrollment => !enrollmentIdsWithPrediction.has(enrollment.id)
    );

    return GottenUserEnrollmentsDomainEvent(enrollmentsWithoutPrediction);
  }
}
