import { DomainEvent } from '@skorify/domain/core';
import {
  RegisterNotificationTokenParam,
  RegisterNotificationTokenUsecase,
  UserContract,
  NotificationTokenAssignedDomainEvent,
  NotGottenUserDomainEvent,
  NotificationTokenAssignmentFailedDomainEvent,
} from '@skorify/domain/user';

export class RegisterNotificationTokenUsecaseImpl extends RegisterNotificationTokenUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: RegisterNotificationTokenParam): Promise<DomainEvent> {
    const { userId, token } = param;

    const userInDB = await this.userContract.getById(userId);

    if (!userInDB) {
      return NotGottenUserDomainEvent();
    }

    userInDB.notificationToken = token;
    const savedUser = await this.userContract.modify(userInDB);

    if (!savedUser) {
      return NotificationTokenAssignmentFailedDomainEvent();
    }

    return NotificationTokenAssignedDomainEvent(savedUser);
  }
}
