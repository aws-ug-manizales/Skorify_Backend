import { DomainEvent } from "@skorify/domain/core";
import {
  CreateUserParam,
  CreateUserUsecase,
  GetUserByIdUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
} from "@skorify/domain/user";

export class CreateUserUsecaseImpl extends CreateUserUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: CreateUserParam): Promise<DomainEvent> {
    const { name } = param;

    const userInDB = await this.userContract.save({ id: crypto.randomUUID(), name });

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent({
      id: userInDB.id,
      name: userInDB.name,
    });
  }
}
