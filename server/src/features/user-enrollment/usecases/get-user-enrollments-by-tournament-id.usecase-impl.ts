import { DomainEvent } from '@skorify/domain/core';

import {
  GetUserEnrollmentsByTournamentIdParam,
  GetUserEnrollmentsByTournamentIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentParamsNotValidDomainEvent,
} from '@skorify/domain/user-enrollment';

export class GetUserEnrollmentsByTournamentIdUsecaseImpl extends GetUserEnrollmentsByTournamentIdUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: GetUserEnrollmentsByTournamentIdParam): Promise<DomainEvent> {
    const { tournamentId } = param;

    if (!tournamentId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    const userEnrollmentsInDB = await this.userEnrollmentContract.filter({
      where: { tournamentId },
    });

    return GottenUserEnrollmentsDomainEvent(userEnrollmentsInDB);
  }
}
