import { DomainEvent } from '@skorify/domain/core';
import {
  DeleteUserParam,
  DeleteUserUsecase,
  NotGottenUserDomainEvent,
  UserContract,
  UserFoundAndDeletedDomainEvent,
} from '@skorify/domain/user';

export class DeleteUserUsecaseImpl extends DeleteUserUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: DeleteUserParam): Promise<DomainEvent> {
    const { Id } = param;

    const deletedUser = await this.userContract.delete(Id);

    if (!deletedUser) {
      return NotGottenUserDomainEvent();
    }

    return UserFoundAndDeletedDomainEvent();
  }
}
