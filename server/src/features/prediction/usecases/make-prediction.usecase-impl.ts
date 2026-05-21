import { BuiltEntityDomainEvent, DomainEvent, Id } from '@skorify/domain/core';
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
import {
  GetUserEnrollmentsByUserIdParam,
  IsAUserInTournamentInstanceUsecase,
  UserEnrollmentEntity,
  UserIsInTournamentInstanceDomainEvent,
} from '@skorify/domain/user-enrollment';

export class MakePredictionUsecaseImpl extends MakePredictionUsecase {
  constructor(
    private getUserByIdUsecase: GetUserByIdUsecase,
    private getMatchByIdUsecase: GetMatchByIdUsecase,
    private predictionContract: PredictionContract,
    private isAUserInTournamentInstanceUsecase: IsAUserInTournamentInstanceUsecase,
  ) {
    super();
  }

  async call(param: MakePredictionParam): Promise<DomainEvent> {
    const { awayScore, tournamentInstanceId, homeScore, matchId, userId } = param;

    // 1. Validación de que dalia exista
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return userDE;
    }

    const user: UserEntity = userDE.payload;

    if (!user.isActive) {
      return UserNotActiveDomainEvent();
    }

    const userEnrollmentExistDE = await this.isAUserInTournamentInstanceUsecase.call({
      userId,
      tournamentInstanceId,
    });
    console.log('userEnrollmentExistDE');
    console.log(userEnrollmentExistDE);

    if (userEnrollmentExistDE.isNot(UserIsInTournamentInstanceDomainEvent)) {
      return userEnrollmentExistDE;
    }

    const userEnrollment: { userEnrollmentId: Id } = userEnrollmentExistDE.payload;
    // 2. Valida el partido
    const matchDE = await this.getMatchByIdUsecase.call({
      matchId,
    });

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE;
    }

    const match: MatchEntity = matchDE.payload;

    if (!match.canBet()) {
      return MatchCannotBeBetedDomainEvent();
    }

    const predictionInDB = await this.predictionContract.filter({
      where: {
        userId,
        matchId,
      },
    });

    if (predictionInDB.length) {
      return UserAlreadyPredictedDomainEvent();
    }

    const predictionDE = PredictionEntity.build({
      id: crypto.randomUUID(),
      userId: userId,
      tournamentInstanceId: tournamentInstanceId,
      matchId: matchId,
      awayScore,
      homeScore,
      earnedPoints: 0,
      hasExactResult: false,
      userEnrollmentId: userEnrollment.userEnrollmentId,
      createdAt: new Date(),
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
