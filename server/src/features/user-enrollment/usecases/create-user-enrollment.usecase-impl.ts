import { DomainEvent } from "@skorify/domain/core";

import {
  CreateUserEnrollmentParam,
  CreateUserEnrollmentUsecase,
  UserEnrollmentContract,
  UserEnrollmentEntity,
  UserEnrollmentEntityNotInstanciableDomainEvent,
  UserEnrollmentNotSavedDomainEvent,
  UserEnrollmentSavedDomainEvent,
  UserEnrollmentParamsNotValidDomainEvent,
} from "@skorify/domain/user-enrollment";

import{
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent
} from "@skorify/domain/user";

import{
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
  NotGottenTournamentInstanceDomainEvent
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
    const {
      userId,
      tournamentInstanceId,
      joinedAt,
      lastPosition,
      currentPosition,
      currentScore,
      streak
    } = param;

    // verificar que los params enviados sean los necesarios
    if (!userId || !tournamentInstanceId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    // Se valida que el usuario exista
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      // return userDE;
      return NotGottenUserDomainEvent();
    }

    // Se valida que el torneo exista
    const tournamentInstanceDE = await this.getTournamentInstanceByIdUsecase.call({
      tournamentInstanceId,
    });

    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
      // return tournamentInstanceDE;
      return NotGottenTournamentInstanceDomainEvent();
    }

    const userEnrollmentDE = UserEnrollmentEntity.build({
      id: crypto.randomUUID(),
      userId: userId,
      tournamentInstanceId: tournamentInstanceId,
      joinedAt: joinedAt ?? new Date(),
      lastPosition: lastPosition ?? 0,
      currentPosition: currentPosition ?? 0,
      currentScore: currentScore ?? 0,
      streak: streak ?? 0,
    });

    if (!userEnrollmentDE) {
      return UserEnrollmentEntityNotInstanciableDomainEvent();
    }

    // const userInDB = await this.userContract.save(user);
    const userEnrollmentInDB = await this.userEnrollmentContract.save(userEnrollmentDE);

    if (!userEnrollmentInDB) {
      return UserEnrollmentNotSavedDomainEvent();
    }

    return UserEnrollmentSavedDomainEvent(userEnrollmentDE);
  }
}
