import {
  PredictionContract,
  PredictionCreatedDomainEvent,
  PredictionEntity,
  PredictionNotCreatedDomainEvent,
  MakePredictionParam,
  MakePredictionUsecase,
  UserAlreadyPredictedDomainEvent,
  UserNotActiveDomainEvent,
} from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";
import {
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  UserEntity,
} from "@skorify/domain/user";
import { GetMatchByIdUsecase, GottenMatchDomainEvent, MatchCannotBeBetedDomainEvent, MatchEntity } from "@skorify/domain/match";

export class MakePredictionUsecaseImpl extends MakePredictionUsecase {
  constructor(
    private getUserByIdUsecase: GetUserByIdUsecase,
    private getMatchByIdUsecase: GetMatchByIdUsecase,
    private predictionContract: PredictionContract,
  ) {
    super();
  }

  async call(param: MakePredictionParam): Promise<DomainEvent> {
    const { awayTeamScore, instanceId, localTeamScore, matchId, userId } = param;

    // 1. Validación de que dalia exista
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return userDE;
    }

    const user = userDE.payload as UserEntity;

    if (!user.isActive) {
      return UserNotActiveDomainEvent();
    }

    // 2. Valida el partido
    const matchDE = await this.getMatchByIdUsecase.call({
      matchId,
    });

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE;
    }

    const match = matchDE.payload as MatchEntity;

    if (!match.canBet()) {
      return MatchCannotBeBetedDomainEvent();
    }

    const predictionInDB = await this.predictionContract.getByUserAndMatch(userId, matchId);

    if (predictionInDB) {
      return UserAlreadyPredictedDomainEvent();
    }

    const prediction = PredictionEntity.build({
      id: crypto.randomUUID(),
      userId: userId as PredictionEntity["userId"],
      instancePlayerId: instanceId as PredictionEntity["instancePlayerId"],
      matchId: matchId as PredictionEntity["matchId"],
      awayTeamScore,
      localTeamScore,
    });

    const savedPrediction = await this.predictionContract.save(prediction);

    if (!savedPrediction) {
      return PredictionNotCreatedDomainEvent();
    }

    return PredictionCreatedDomainEvent(savedPrediction);
  }
}
