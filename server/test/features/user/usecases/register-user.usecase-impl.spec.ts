import { DomainEvent, type Id } from '@skorify/domain/core';
import {
  CreateUserUsecase,
  GottenUserDomainEvent,
  IdentityProviderContract,
  NotGottenUserDomainEvent,
  UserRegisteredDomainEvent,
  UserRegistrationInvalidParamsDomainEvent,
  UserWithEmailAlreadyExistDomainEvent,
  type RegisterUserParam,
} from '@skorify/domain/user';
import { UserEntity } from '@skorify/domain/user/user.entity';
import { RegisterUserUsecaseImpl } from '../../../../src/features/user/usecases/register-user.usecase-impl';

describe('RegisterUserUsecaseImpl', () => {
  const userId = '11111111-1111-1111-1111-111111111111' as Id;

  type MockCreateUser = Pick<CreateUserUsecase, 'call'>;
  type MockIdentityProvider = Pick<IdentityProviderContract, 'update'>;

  const defaultParam: RegisterUserParam = {
    name: 'Bryan Arroyave',
    email: 'bryan@test.com',
  };

  function makeUser(): UserEntity {
    return UserEntity.build({
      id: userId,
      name: 'Bryan Arroyave',
      email: 'bryan@test.com',
      notificationToken: '',
      isActive: true,
      createdAt: new Date(),
    }).payload as UserEntity;
  }

  function makeUsecase(
    createUserResult: DomainEvent = GottenUserDomainEvent(makeUser()),
    identityOverrides: Partial<MockIdentityProvider> = {},
  ) {
    const createUserUsecase: MockCreateUser = {
      call: jest.fn().mockResolvedValue(createUserResult),
    };
    const identityProviderContract: MockIdentityProvider = {
      update: jest.fn().mockResolvedValue(undefined),
      ...identityOverrides,
    };
    return {
      usecase: new RegisterUserUsecaseImpl(
        createUserUsecase as CreateUserUsecase,
        identityProviderContract as IdentityProviderContract,
      ),
      createUserUsecase,
      identityProviderContract,
    };
  }

  describe('validaciones de parámetros', () => {
    it('retorna UserRegistrationInvalidParamsDomainEvent cuando el nombre está vacío', async () => {
      const { usecase } = makeUsecase();

      const res = await usecase.call({ ...defaultParam, name: '' });

      expect(res.eventName).toBe(UserRegistrationInvalidParamsDomainEvent.eventName);
    });

    it('retorna UserRegistrationInvalidParamsDomainEvent cuando el nombre es solo espacios', async () => {
      const { usecase } = makeUsecase();

      const res = await usecase.call({ ...defaultParam, name: '   ' });

      expect(res.eventName).toBe(UserRegistrationInvalidParamsDomainEvent.eventName);
    });

    it('retorna UserRegistrationInvalidParamsDomainEvent cuando el email no tiene formato válido', async () => {
      const { usecase } = makeUsecase();

      const res = await usecase.call({ ...defaultParam, email: 'correo-invalido' });

      expect(res.eventName).toBe(UserRegistrationInvalidParamsDomainEvent.eventName);
    });

    it('retorna UserRegistrationInvalidParamsDomainEvent cuando el email está vacío', async () => {
      const { usecase } = makeUsecase();

      const res = await usecase.call({ ...defaultParam, email: '' });

      expect(res.eventName).toBe(UserRegistrationInvalidParamsDomainEvent.eventName);
    });

    it('no llama a createUserUsecase cuando los parámetros son inválidos', async () => {
      const { usecase, createUserUsecase } = makeUsecase();

      await usecase.call({ ...defaultParam, name: '' });

      expect(createUserUsecase.call).not.toHaveBeenCalled();
    });
  });

  it('propaga el evento de error cuando createUserUsecase falla (ej: email duplicado)', async () => {
    const { usecase } = makeUsecase(UserWithEmailAlreadyExistDomainEvent(makeUser()));

    const res = await usecase.call(defaultParam);

    expect(res.eventName).toBe(UserWithEmailAlreadyExistDomainEvent.eventName);
  });

  it('propaga NotGottenUserDomainEvent cuando createUserUsecase no puede guardar', async () => {
    const { usecase } = makeUsecase(NotGottenUserDomainEvent());

    const res = await usecase.call(defaultParam);

    expect(res.eventName).toBe(NotGottenUserDomainEvent.eventName);
  });

  it('registra el usuario, llama al identity provider y retorna UserRegisteredDomainEvent', async () => {
    const user = makeUser();
    const { usecase, identityProviderContract } = makeUsecase(GottenUserDomainEvent(user));

    const res = await usecase.call(defaultParam);

    expect(res.eventName).toBe(UserRegisteredDomainEvent.eventName);
    expect(res.payload).toEqual(user);
    expect(identityProviderContract.update).toHaveBeenCalledWith(user.id, {
      name: user.name,
      email: user.email,
    });
  });

  it('llama a createUserUsecase con el nombre recortado de espacios', async () => {
    const { usecase, createUserUsecase } = makeUsecase();

    await usecase.call({ ...defaultParam, name: '  Bryan  ' });

    expect(createUserUsecase.call).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bryan' }),
    );
  });
});
