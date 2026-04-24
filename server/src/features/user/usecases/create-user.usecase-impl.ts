import { DomainEvent } from "@skorify/domain/core";
import {
  CreateUserParam,
  CreateUserUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
  UserEntity,
} from "@skorify/domain/user";

export class CreateUserUsecaseImpl extends CreateUserUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: CreateUserParam): Promise<DomainEvent> {
    const { name } = param;

    const user = UserEntity.build({
      id: crypto.randomUUID(),
      name,
    });
    const userInDB = await this.userContract.save(user);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent(user);
  }
}
