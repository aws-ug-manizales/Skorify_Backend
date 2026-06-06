import { DomainEvent } from '@skorify/domain/core';
import {
  GetUserEnrollmentsByTournamentInstanceIdParam,
  GetUserEnrollmentsByTournamentInstanceIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentParamsNotValidDomainEvent,
} from '@skorify/domain/user-enrollment';

export class GetUserEnrollmentsByTournamentInstanceIdUsecaseImpl extends GetUserEnrollmentsByTournamentInstanceIdUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: GetUserEnrollmentsByTournamentInstanceIdParam): Promise<DomainEvent> {
    const { tournamentInstanceId } = param;

    if (!tournamentInstanceId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    const userEnrollmentsInDB = await this.userEnrollmentContract.filter({
      where: { tournamentInstanceId },
    });

    return GottenUserEnrollmentsDomainEvent(userEnrollmentsInDB);
  }
}
