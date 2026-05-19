import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';

import {
  CreateUserEnrollmentParam,
  CreateUserEnrollmentUsecase,
  IsAUserInTournamentInstanceUsecase,
  NotSavedUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
  UserIsInTournamentInstanceDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentEntity,
  UserEnrollmentParamsNotValidDomainEvent,
  UserIsNotInTournamentInstanceDomainEvent,
} from '@skorify/domain/user-enrollment';

import {
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
} from '@skorify/domain/user';

import {
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent,
  TournamentInstanceEntity,
} from '@skorify/domain/tournament-instance';

export class CreateUserEnrollmentUsecaseImpl extends CreateUserEnrollmentUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract,

    private getUserByIdUsecase: GetUserByIdUsecase,
    private getTournamentInstanceByIdUsecase: GetTournamentInstanceByIdUsecase,
    private isAUserInTournamentInstanceUsecase: IsAUserInTournamentInstanceUsecase,
  ) {
    super();
  }

  async call(param: CreateUserEnrollmentParam): Promise<DomainEvent> {
    const { userId, tournamentInstanceId } = param;

    if (!userId || !tournamentInstanceId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return NotGottenUserDomainEvent();
    }

    const tournamentInstanceDE = await this.getTournamentInstanceByIdUsecase.call({
      tournamentInstanceId,
    });

    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
      return tournamentInstanceDE;
    }
    const tournamentInstance: TournamentInstanceEntity = tournamentInstanceDE.payload;

    const userEnrollmentExistDE = await this.isAUserInTournamentInstanceUsecase.call({
      userId,
      tournamentInstanceId,
    });

    if (userEnrollmentExistDE.isNot(UserIsNotInTournamentInstanceDomainEvent)) {
      return userEnrollmentExistDE;
    }

    const userEnrollmentDE = UserEnrollmentEntity.build({
      id: crypto.randomUUID(),
      userId: userId,
      tournamentInstanceId: tournamentInstanceId,
      tournamentId: tournamentInstance.tournamentId,
      maxStreak: 0,
      joinedAt: new Date(),
      lastPosition: null,
      currentPosition: null,
      currentScore: 0,
      streak: 0,
    });

    if (userEnrollmentDE.isNot(BuiltEntityDomainEvent)) {
      return userEnrollmentDE;
    }
    const userEnrollment = userEnrollmentDE.payload;

    const userEnrollmentInDB = await this.userEnrollmentContract.save(userEnrollment);

    if (!userEnrollmentInDB) {
      return NotSavedUserEnrollmentDomainEvent();
    }

    return SavedUserEnrollmentDomainEvent(userEnrollment);
  }
}
