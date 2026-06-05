import { BuiltEntityDomainEvent, DomainEvent, Id } from '@skorify/domain/core';
import {
  GetMatchByIdUsecase,
  GottenMatchDomainEvent,
  MatchCannotBeBetedDomainEvent,
  MatchEntity,
  MatchStatus,
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
  IsAUserInTournamentInstanceUsecase,
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

    const [userDE, userEnrollmentExistDE, matchDE] = await Promise.all([
      this.getUserByIdUsecase.call({
        userId,
      }),
      this.isAUserInTournamentInstanceUsecase.call({
        userId,
        tournamentInstanceId,
      }),
      this.getMatchByIdUsecase.call({
        matchId,
      }),
    ]);

    if (userDE.isNot(GottenUserDomainEvent)) {
      return userDE;
    }

    const user: UserEntity = userDE.payload;

    if (!user.isActive) {
      return UserNotActiveDomainEvent();
    }

    if (userEnrollmentExistDE.isNot(UserIsInTournamentInstanceDomainEvent)) {
      return userEnrollmentExistDE;
    }

    const userEnrollment: { userEnrollmentId: Id } = userEnrollmentExistDE.payload;

    if (matchDE.isNot(GottenMatchDomainEvent)) {
      return matchDE;
    }

    const match: MatchEntity = matchDE.payload;

    const status = match.status ?? match['_status'];
    const timeToClose = match.timeToCloseInMinutes ?? match['_timeToCloseInMinutes'];
    const diff = new Date(match.kickOff).getTime() - Date.now();
    const window = timeToClose * 60 * 1000;

    const canBet =
      status == MatchStatus.Draft || (status == MatchStatus.Scheduled && diff > window && diff > 0);
    if (!canBet) {
      return MatchCannotBeBetedDomainEvent();
    }

    const predictionInDB = await this.predictionContract.filter({
      where: {
        userId,
        tournamentInstanceId,
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
