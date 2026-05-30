import { DomainEvent } from '@skorify/domain/core';
import {
  EditPredictionDirectlyParam,
  EditPredictionDirectlyUsecase,
  GetPredictionByIdUsecase,
  GottenPredictionDomainEvent,
  NotEditedPredictionDomainEvent,
  PredictionContract,
  PredictionEditedDomainEvent,
  PredictionEntity,
} from '@skorify/domain/prediction';

export class EditPredictionDirectlyUsecaseImpl extends EditPredictionDirectlyUsecase {
  constructor(
    private getPredictionByIdUsecase: GetPredictionByIdUsecase,
    private predictionContract: PredictionContract,
  ) {
    super();
  }
  async call(param: EditPredictionDirectlyParam): Promise<DomainEvent> {
    const { predictionId, awayScore, homeScore, earnedPoints, hasExactResult } = param;

    const prediontionDE = await this.getPredictionByIdUsecase.call({
      predictionId,
    });

    if (prediontionDE.isNot(GottenPredictionDomainEvent)) {
      return prediontionDE;
    }

    const prediction: PredictionEntity = prediontionDE.payload;

    prediction.awayScore = awayScore;
    prediction.homeScore = homeScore;
    prediction.earnedPoints = earnedPoints;
    prediction.hasExactResult = hasExactResult;

    const edited = await this.predictionContract.modify(prediction);

    if (!edited) {
      return NotEditedPredictionDomainEvent();
    }
    return PredictionEditedDomainEvent(prediction);
  }
}
