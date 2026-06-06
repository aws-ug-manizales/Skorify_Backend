import { DomainEvent } from '@skorify/domain/core';
import {
  GetUsersByIdsParam,
  GetUsersByIdsUsecase,
  GottenUsersDomainEvent,
  UserContract,
} from '@skorify/domain/user';

export class GetUsersByIdsUsecaseImpl extends GetUsersByIdsUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: GetUsersByIdsParam): Promise<DomainEvent> {
    const { userIds } = param;

    const parsed = Array.isArray(userIds) ? userIds : [userIds];
    const promises = parsed.map((userId) => this.userContract.getById(userId));

    const usersInDB = await Promise.all(promises);

    const userInDB = usersInDB.filter((user) => user !== null);

    return GottenUsersDomainEvent(userInDB);
  }
}
