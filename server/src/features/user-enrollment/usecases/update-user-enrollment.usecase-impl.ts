import {
  UpdateUserEnrollmentParam,
  UpdateUserEnrollmentUsecase,
  UserEnrollmentContract,
  NotGottenUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent,
} from "@skorify/domain/user-enrollment";
import { DomainEvent } from "@skorify/domain/core";

export class UpdateUserEnrollmentUsecaseImpl extends UpdateUserEnrollmentUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: UpdateUserEnrollmentParam): Promise<DomainEvent> {
    const { userEnrollmentId, points, isExact } = param;

    const userEnrollment = await this.userEnrollmentContract.getById(userEnrollmentId);

    if (!userEnrollment) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    userEnrollment.applyScore(points, isExact);

    const saved = await this.userEnrollmentContract.modifyById(userEnrollmentId, userEnrollment);

    if (!saved) {
        return NotGottenUserEnrollmentDomainEvent();
    }

    return SavedUserEnrollmentDomainEvent(saved);
  }
}
