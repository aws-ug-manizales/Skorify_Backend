import {
  UpdateCurrentPositionParam,
  UpdateCurrentPositionUsecase,
  UserEnrollmentContract,
  NotGottenUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
} from '@skorify/domain/user-enrollment';
import { DomainEvent } from '@skorify/domain/core';

export class UpdateCurrentPositionUsecaseImpl extends UpdateCurrentPositionUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: UpdateCurrentPositionParam): Promise<DomainEvent> {
    const { userEnrollmentId, currentPosition } = param;

    const userEnrollment = await this.userEnrollmentContract.getById(userEnrollmentId);

    if (!userEnrollment) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    userEnrollment.lastPosition = userEnrollment.currentPosition;
    userEnrollment.currentPosition = currentPosition;

    const saved = await this.userEnrollmentContract.modify(userEnrollment);

    if (!saved) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    return SavedUserEnrollmentDomainEvent(saved);
  }
}
