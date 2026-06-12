import {
  UpdateUserEnrollmentParam,
  UpdateUserEnrollmentUsecase,
  UserEnrollmentContract,
  NotGottenUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
} from '@skorify/domain/user-enrollment';
import { DomainEvent } from '@skorify/domain/core';
import { Logger } from '@aws-lambda-powertools/logger';

export class UpdateUserEnrollmentUsecaseImpl extends UpdateUserEnrollmentUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract,
    private logger: Logger,
  ) {
    super();
  }

  async call(param: UpdateUserEnrollmentParam): Promise<DomainEvent> {
    const { userEnrollmentId, points, isExact } = param;

    let userEnrollment;
    try {
      userEnrollment = await this.userEnrollmentContract.getById(userEnrollmentId);
    } catch (error) {
      this.logger.error('Error fetching user enrollment by id', { userEnrollmentId, error });
      return NotGottenUserEnrollmentDomainEvent();
    }

    if (!userEnrollment) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    userEnrollment.applyScore(points, isExact);

    let saved;
    try {
      saved = await this.userEnrollmentContract.modify(userEnrollment);
    } catch (error) {
      this.logger.error('Error updating user enrollment', { userEnrollmentId, points, isExact, error });
      return NotGottenUserEnrollmentDomainEvent();
    }

    if (!saved) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    return SavedUserEnrollmentDomainEvent(saved);
  }
}
