import {
  ResetStreakForMatchParam,
  ResetStreakForMatchUsecase,
  UserEnrollmentContract,
  StreakResetForMatchDomainEvent,
} from '@skorify/domain/user-enrollment';
import { DomainEvent } from '@skorify/domain/core';

export class ResetStreakForMatchUsecaseImpl extends ResetStreakForMatchUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: ResetStreakForMatchParam): Promise<DomainEvent> {
    const { enrollmentId, matchId } = param;

    await this.userEnrollmentContract.resetStreakForMatch(enrollmentId, matchId);

    return StreakResetForMatchDomainEvent();
  }
}
