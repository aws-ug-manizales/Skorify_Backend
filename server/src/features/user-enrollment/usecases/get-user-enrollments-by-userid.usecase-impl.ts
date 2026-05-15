import { DomainEvent } from "@skorify/domain/core";

import {
  GetUserEnrollmentsByUserIdParam,
  GetUserEnrollmentsByUserIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  NotGottenUserEnrollmentsDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentParamsNotValidDomainEvent
} from "@skorify/domain/user-enrollment";


export class GetUserEnrollmentsByUserIdUsecaseImpl extends GetUserEnrollmentsByUserIdUsecase {
  constructor(
    private userEnrollmentContract: UserEnrollmentContract
  ) {
    super();
  }

  async call(param: GetUserEnrollmentsByUserIdParam): Promise<DomainEvent> {
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
