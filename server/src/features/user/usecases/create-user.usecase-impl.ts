import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import { StorageContract } from '@skorify/domain/core';
import {
  CreateUserParam,
  CreateUserUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
  UserEntity,
  UserWithEmailAlreadyExistDomainEvent,
} from '@skorify/domain/user';

export class CreateUserUsecaseImpl extends CreateUserUsecase {
  constructor(
    private userContract: UserContract,
    private storageContract: StorageContract,
  ) {
    super();
  }

  async call(param: CreateUserParam): Promise<DomainEvent> {
    const { name, email, image } = param;

    const users = await this.userContract.filter({
      where: {
        email,
      },
    });

    if (users.length) {
      return UserWithEmailAlreadyExistDomainEvent(users[0]);
    }

    const userDE = UserEntity.build({
      id: crypto.randomUUID(),
      name,
      email,
      notificationToken: '',
      isActive: true,
      createdAt: new Date(),
      role: 'general',
    });

    if (userDE.isNot(BuiltEntityDomainEvent)) {
      return userDE;
    }

    const user = userDE.payload as UserEntity;
    if (image) {
      const key = `user/${user.id}/profile`;

      await this.storageContract.uploadImage(key, image);
      user.image = key;
    }

    const userInDB = await this.userContract.save(user);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent(user);
  }
}
