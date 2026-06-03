import { DomainEvent } from '@skorify/domain/core';
import {
  GetUserBySubParam,
  GetUserBySubUsecase,
  GottenUserDomainEvent,
  NotGottenUserDomainEvent,
  UserContract,
} from '@skorify/domain/user';

export class GetUserBySubUsecaseImpl extends GetUserBySubUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: GetUserBySubParam): Promise<DomainEvent> {
    const { sub } = param;

    const usersInDB = await this.userContract.filter({
      where: { sub },
    });

    if (!usersInDB.length) {
      return NotGottenUserDomainEvent();
    }

    return GottenUserDomainEvent(usersInDB[0]);
  }
}
