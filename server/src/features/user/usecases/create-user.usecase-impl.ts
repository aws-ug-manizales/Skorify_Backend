import { DomainEvent } from "@skorify/domain/core";
import {
  CreateUserParam,
  CreateUserUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
  UserEntity,
  UserWithEmailAlreadyExistDomainEvent,
} from "@skorify/domain/user";

export class CreateUserUsecaseImpl extends CreateUserUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: CreateUserParam): Promise<DomainEvent> {
    const { name, email } = param;

    const users = await this.userContract.filter({
      where: {
        email,
      },
    });

    if (users.length) {
      return UserWithEmailAlreadyExistDomainEvent(users[0]);
    }

    const user = UserEntity.build({
      id: crypto.randomUUID(),
      name,
      email,
      notificationToken: "",
      createdAt: new Date(),
    });
    
    if (!user) {
      return UserWithEmailAlreadyExistDomainEvent(users[0]);
    }

    const userInDB = await this.userContract.save(user);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent(user);
  }
}
