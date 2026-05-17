import { DomainEvent, StorageContract } from '@skorify/domain/core';
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

    const user = UserEntity.build({
      id: crypto.randomUUID(),
      name,
      email,
      notificationToken: '',
      createdAt: new Date(),
    });

    if (!user) {
      return UserWithEmailAlreadyExistDomainEvent(users[0]);
    }

    // Subir la imagen al storage si se proporciona
    let imageBuffer: Buffer | undefined;
    if (image) {
      const key = `user/${user.id}/profile`;

      await this.storageContract.uploadImage(key, image);
      imageBuffer = image;
      user.image = key;
    }

    const userInDB = await this.userContract.save(user);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent(user);
  }
}
