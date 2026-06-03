import { DomainEvent } from '@skorify/domain/core';
import {
  GetUserByIdParam,
  GetAvailableUsersUsecase,
  UserContract,
  GottenUsersDomainEvent,
} from '@skorify/domain/user';

export class GetAvailableUsersUsecaseImpl extends GetAvailableUsersUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: GetUserByIdParam): Promise<DomainEvent> {
    const userInDB = await this.userContract.getAll();

    return GottenUsersDomainEvent(userInDB);
  }
}
