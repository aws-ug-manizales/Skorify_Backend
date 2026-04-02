import { DomainEvent } from "@skorify/domain/core";
import {
  GetUserByIdParam,
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
} from "@skorify/domain/user";

export class GetUserByIdUsecaseImpl extends GetUserByIdUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: GetUserByIdParam): Promise<DomainEvent> {
    const { userId } = param;

    const userInDB = await this.userContract.getById(userId);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent({
      id: "7e6f6d92-e8bd-4aab-a027-66f4ec31ba8e",
      name: "Bryan",
    });
  }
}
