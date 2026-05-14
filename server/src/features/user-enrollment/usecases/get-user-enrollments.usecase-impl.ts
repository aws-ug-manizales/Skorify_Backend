import { DomainEvent } from "@skorify/domain/core";

import {
  GetUserEnrollmentsParam,
  GetUserEnrollmentsUsecase,
  GottenUserEnrollmentsDomainEvent,
  NotGottenUserEnrollmentsDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentParamsNotValidDomainEvent
} from "@skorify/domain/user-enrollment";


export class GetUserEnrollmentsUsecaseImpl extends GetUserEnrollmentsUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract
  ) {
    super();
  }

  async call(param: GetUserEnrollmentsParam): Promise<DomainEvent> {
    const { userId } = param;

    if (!userId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    const userEnrollmentsInDB = await this.userEnrollmentContract.filter({ userId });

    if (!userEnrollmentsInDB) {
      return NotGottenUserEnrollmentsDomainEvent();
    };

    return GottenUserEnrollmentsDomainEvent(userEnrollmentsInDB);
  }
}
