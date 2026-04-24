import { DomainEvent } from "@skorify/domain/core";
import {
  CreateUserParam,
  CreateUserUsecase,
  UserContract,
} from "@skorify/domain/user";
import {
  BasicDomainEvent,
} from "@skorify/domain/prediction";

export class CreateUserUsecaseImpl extends CreateUserUsecase {
  constructor(private userContract: UserContract) {
    super();
  }

  async call(param: CreateUserParam): Promise<DomainEvent> {
    return BasicDomainEvent();
  }
}
