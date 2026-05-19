import { DomainEvent } from '@skorify/domain/core';
import { GetMatchByIdUsecase, MatchEntity } from '@skorify/domain/match';
import {
  EditPredictionParam,
  EditPredictionUsecase,
  GetPredictionByIdUsecase,
  GottenPredictionDomainEvent,
  NotEditedPredictionDomainEvent,
  PassedPredictionWindowDomainEvent,
  PredictionContract,
  PredictionEditedDomainEvent,
  PredictionEntity,
} from '@skorify/domain/prediction';

export class EditPredictionUsecaseImpl extends EditPredictionUsecase {
  constructor(
    private getPredictionByIdUsecase: GetPredictionByIdUsecase,
    private getMatchByIdUsecase: GetMatchByIdUsecase,
    private predictionContract: PredictionContract,
    private editingWindow: number,
  ) {
    super();
  }
  async call(param: EditPredictionParam): Promise<DomainEvent> {
    const { awayScore, homeScore, predictionId } = param;

    const prediontionDE = await this.getPredictionByIdUsecase.call({
      predictionId,
    });

    if (prediontionDE.isNot(GottenPredictionDomainEvent)) {
      return prediontionDE;
    }
    const now = new Date();

    const prediction: PredictionEntity = prediontionDE.payload;

    const matchDE = await this.getMatchByIdUsecase.call({
      matchId: prediction.matchId,
    });
    const match: MatchEntity = matchDE.payload;

    const diffMs = match.kickOff.getTime() - now.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < this.editingWindow) {
      return PassedPredictionWindowDomainEvent();
    }

    prediction.awayScore = awayScore;
    prediction.homeScore = homeScore;

    const edited = await this.predictionContract.modifyById(prediction.id, prediction);

    if (!edited) {
      return NotEditedPredictionDomainEvent();
    }
    return PredictionEditedDomainEvent(prediction);
  }
}
