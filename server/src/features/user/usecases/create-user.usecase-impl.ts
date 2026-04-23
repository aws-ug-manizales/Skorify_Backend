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

    const userInDB = await this.userContract.save(
      UserEntity.build({
        id: crypto.randomUUID(),
        name,
        isActive: true,
      }),
    );

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent({
      id: userInDB.id,
      name: userInDB.name,
      isActive: userInDB.isActive,
    });
  }
}
