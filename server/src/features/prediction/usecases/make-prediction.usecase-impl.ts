import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import {
  GetMatchByIdUsecase,
  GottenMatchDomainEvent,
  MatchCannotBeBetedDomainEvent,
  MatchEntity,
} from '@skorify/domain/match';
import {
  MakePredictionParam,
  MakePredictionUsecase,
  PredictionContract,
  PredictionCreatedDomainEvent,
  PredictionEntity,
  PredictionNotCreatedDomainEvent,
  UserAlreadyPredictedDomainEvent,
  UserNotActiveDomainEvent,
} from '@skorify/domain/prediction';
import { GetUserByIdUsecase, GottenUserDomainEvent, UserEntity } from '@skorify/domain/user';

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

    const predictionDE = PredictionEntity.build({
      id: crypto.randomUUID(),
      userId: userId as PredictionEntity['userId'],
      instancePlayerId: instanceId as PredictionEntity['instancePlayerId'],
      matchId: matchId as PredictionEntity['matchId'],
      awayTeamScore,
      localTeamScore,
      score: 0,
    });

    if (predictionDE.isNot(BuiltEntityDomainEvent)) {
      return predictionDE;
    }

    const prediction = predictionDE.payload;
    const savedPrediction = await this.predictionContract.save(prediction);

    if (!savedPrediction) {
      return PredictionNotCreatedDomainEvent();
    }

    return PredictionCreatedDomainEvent(savedPrediction);
  }
}
