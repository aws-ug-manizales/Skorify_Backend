import { DomainEvent } from '@skorify/domain/core';
import {
  IsAUserInTournamentInstanceParam,
  IsAUserInTournamentInstanceUsecase,
  UserIsInTournamentInstanceDomainEvent,
  UserEnrollmentContract,
  UserIsNotInTournamentInstanceDomainEvent,
} from '@skorify/domain/user-enrollment';

export class IsAUserInTournamentInstanceUsecaseImpl extends IsAUserInTournamentInstanceUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }
  async call(param: IsAUserInTournamentInstanceParam): Promise<DomainEvent> {
    const { tournamentInstanceId, userId } = param;
    const userEnrollments = await this.userEnrollmentContract.filter({
      where: {
        tournamentInstanceId,
        userId,
      },
    });

    if (userEnrollments.length) {
      return UserIsInTournamentInstanceDomainEvent({
        userEnrollmentId: userEnrollments[0].id,
      });
    }
    return UserIsNotInTournamentInstanceDomainEvent();
  }
}
