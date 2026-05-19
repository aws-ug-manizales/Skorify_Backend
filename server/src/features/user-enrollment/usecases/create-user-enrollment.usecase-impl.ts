import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';

import {
  CreateUserEnrollmentParam,
  CreateUserEnrollmentUsecase,
  NotSavedUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
  UserEnrollmentAlreadyExistsDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentEntity,
  UserEnrollmentParamsNotValidDomainEvent,
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
      return NotGottenTournamentInstanceDomainEvent();
    }
    const tournamentInstance: TournamentInstanceEntity = tournamentInstanceDE.payload;

    const userEnrollmentExist = await this.userEnrollmentContract.filter({
      where: {
        userId,
        tournamentInstanceId,
      },
    });

    if (userEnrollmentExist.length > 0) {
      return UserEnrollmentAlreadyExistsDomainEvent({
        userEnrollmentId: userEnrollmentExist[0].id,
      });
    }

    const userEnrollmentDE = UserEnrollmentEntity.build({
      id: crypto.randomUUID(),
      userId: userId,
      tournamentInstanceId: tournamentInstanceId,
      tournamentId: tournamentInstance.tournamentId,
      joinedAt: new Date(),
      lastPosition: 0,
      currentPosition: 0,
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
