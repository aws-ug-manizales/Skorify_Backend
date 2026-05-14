import { DomainEvent } from "@skorify/domain/core";
import {
  GetUserEnrollmentByIdParam,
  GetUserEnrollmentByIdUsecase,
  GottenUserEnrollmentDomainEvent,
  NotGottenUserEnrollmentDomainEvent,
  UserEnrollmentContract,
  UserEnrollmentParamsNotValidDomainEvent,
} from "@skorify/domain/user-enrollment";

export class GetUserEnrollmentByIdUsecaseImpl extends GetUserEnrollmentByIdUsecase {
  constructor(private userEnrollmentContract: UserEnrollmentContract) {
    super();
  }

  async call(param: GetUserEnrollmentByIdParam): Promise<DomainEvent> {
    const { userEnrollmentId } = param;

    // verificar que los params enviados sea userEnrollmentId
    if (!userEnrollmentId) {
      return UserEnrollmentParamsNotValidDomainEvent();
    }

    const userEnrollmentInDB = await this.userEnrollmentContract.getById(
      userEnrollmentId,
    );

    if (!userEnrollmentInDB) {
      return NotGottenUserEnrollmentDomainEvent();
    }

    return GottenUserEnrollmentDomainEvent(userEnrollmentInDB);
  }
}