import { DomainEvent } from "@skorify/domain/core";

import {
  CreateUserEnrollmentParam,
  CreateUserEnrollmentUsecase,
  UserEnrollmentContract,
  UserEnrollmentEntity,
  UserEnrollmentEntityNotInstanciableDomainEvent,
  NotSavedUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
  UserEnrollmentParamsNotValidDomainEvent,
  UserEnrollmentAlreadyExistsDomainEvent,
} from "@skorify/domain/user-enrollment";

import {
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
} from "@skorify/domain/user";

import {
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent,
} from "@skorify/domain/tournament-instance";

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

    // verify that the parameters sent are the correct ones
    if (!userId || !tournamentInstanceId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    // It is verified that the user exists
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return NotGottenUserDomainEvent();
    }

    // It is verified that the tournamentInstance exists
    const tournamentInstanceDE =
      await this.getTournamentInstanceByIdUsecase.call({
        tournamentInstanceId,
      });

    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
      return NotGottenTournamentInstanceDomainEvent();
    }

    // It is verified that the user is not already enrolled in the tournamentInstance
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
      joinedAt: new Date(),
      lastPosition: 0,
      currentPosition: 0,
      currentScore: 0,
      streak: 0,
    });

    if (!userEnrollmentDE) {
      return UserEnrollmentEntityNotInstanciableDomainEvent();
    }

    const userEnrollmentInDB =
      await this.userEnrollmentContract.save(userEnrollmentDE);

    if (!userEnrollmentInDB) {
      return NotSavedUserEnrollmentDomainEvent();
    }

    return SavedUserEnrollmentDomainEvent(userEnrollmentDE);
  }
}
