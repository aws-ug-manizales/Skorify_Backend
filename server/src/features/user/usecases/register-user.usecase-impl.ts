import { DomainEvent } from '@skorify/domain/core';
import {
  CreateUserUsecase,
  GottenUserDomainEvent,
  IdentityProviderContract,
  RegisterUserParam,
  RegisterUserUsecase,
  UserEntity,
  UserRegisteredDomainEvent,
  UserRegistrationInvalidParamsDomainEvent,
} from '@skorify/domain/user';

export class RegisterUserUsecaseImpl extends RegisterUserUsecase {
  constructor(
    private createUserUsecase: CreateUserUsecase,
    private identityProviderContract: IdentityProviderContract,
  ) {
    super();
  }

  async call(param: RegisterUserParam): Promise<DomainEvent> {
    const { name, email, password, } = param;

    if (!this.isValidPassword(password)) {
      return UserRegistrationInvalidParamsDomainEvent();
    }

    if (!name?.trim()) {
      return UserRegistrationInvalidParamsDomainEvent();
    }

    if (!email || !this.isValidEmail(email)) {
      return UserRegistrationInvalidParamsDomainEvent();
    }

    const createDE = await this.createUserUsecase.call({ name: name.trim(), email });

    if (createDE.isNot(GottenUserDomainEvent)) {
      return createDE;
    }

    const user = createDE.payload as UserEntity;

    await this.identityProviderContract.update(user.id, password, {
      name: user.name,
      email: user.email,
    });

    return UserRegisteredDomainEvent(user);
  }

  private isValidPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    );
  }
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
