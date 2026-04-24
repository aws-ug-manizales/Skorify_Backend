import {
  CalculateMatchScoreParam,
  CalculateMatchScoreUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract,
  MatchEntity
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";
import { PredictionEntity, UpdatePredictionScoreUsecase } from "@skorify/domain/prediction";
import { UserContract, GetUserByIdUsecase, GottenUserDomainEvent } from "@skorify/domain/user";

export class CalculateMatchScoreUsecaseImpl extends CalculateMatchScoreUsecase {
  constructor(
    private matchContract: MatchContract,
    private updatePredictionScoreUsecase: UpdatePredictionScoreUsecase,
    private userContract: UserContract,
    private getUserByIdUsecase: GetUserByIdUsecase
  ) {
    super();
  }

  async call(param: CalculateMatchScoreParam): Promise<DomainEvent> {
    const { matchId } = param;

    const match = await this.matchContract.getById(matchId);

    if (!match) {
      return MatchDoesNotExistDomainEvent();
    }

    if (match.isMatchClose()) {
      //TODO: Change domain event to match is close
      return MatchDoesNotExistDomainEvent();
    }


    match.setScores(4, 2);
    const predictions = await this.matchContract.getPredictionsByMatchId(matchId);

    if (predictions && predictions.length > 0) {
      await this.calculateScores(match, predictions);
    }

    return GottenMatchDomainEvent(match);
  }

  private async calculateScores(match: MatchEntity, predictions: PredictionEntity[]): Promise<void> {


await Promise.all(predictions.map(async (prediction) => {
      const result = prediction.calculateScore(match.awayTeamScore, match.localTeamScore);

      const scoreResult = result;
      console.log({
        predictionId: prediction.id,
        prediction: `${prediction.awayTeamScore}:${prediction.localTeamScore}`,
        matchResult: `${match.awayTeamScore}:${match.localTeamScore}`,
        scoreResult: scoreResult.total,
        breakdown: scoreResult.breakdown
      });

      await this.updatePredictionScoreUsecase.call({
        predictionId: prediction.id,
        score: scoreResult.total,
        isExactScore: prediction.isExactScore
      });

      // Lógica de racha (streak)
      const userDE = await this.getUserByIdUsecase.call({ userId: prediction.userId });
      if (userDE.is(GottenUserDomainEvent)) {
        const user = userDE.payload as any; // Cast a any temporalmente por falta de propiedad streak en el dominio
        const currentStreak = user.streak || 0;
        const newStreak = prediction.isExactScore ? currentStreak + 1 : 0;

        await this.userContract.modifyById(user.id, {
          ...user,
          streak: newStreak
        } as any);
      }
    }));
  }
}
