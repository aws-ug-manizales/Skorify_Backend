import { DomainEvent, EntityNotInstanciableDomainEvent, Id } from '@skorify/domain/core';
import type { CreateTournamentParam } from '@skorify/domain/tournament';
import {
  MatchType,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from '@skorify/domain/tournament';
import {
  CreateTournamentInstanceUsecase,
  TournamentInstanceEntity,
  TournamentInstanceSavedDomainEvent,
} from '@skorify/domain/tournament-instance';
import { GetUserByIdUsecase, GottenUserDomainEvent, UserEntity } from '@skorify/domain/user';
import { CreateTournamentUsecaseImpl } from '../../../../src/features/tournament/usecases/create-tournament.usecase-impl';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ownerId = '99999999-9999-9999-9999-999999999999' as Id;

const validParam: CreateTournamentParam = {
  name: 'World Cup 2026',
  matchType: MatchType.SingleMatchPerRound,
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-07-15'),
  userId: ownerId,
};

function buildFakeOwner(): UserEntity {
  return UserEntity.build({
    id: ownerId,
    name: 'Owner',
    email: 'owner@test.com',
    isActive: true,
    notificationToken: '',
    createdAt: new Date(),
  }).payload as UserEntity;
}

function buildFakeInstance(): TournamentInstanceEntity {
  return TournamentInstanceEntity.build({
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' as Id,
    name: 'World Cup 2026-Global',
    ownerId,
    tournamentId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' as Id,
    state: 'active',
    inviteCode: 'ABCDEF',
    createdAt: new Date(),
  }).payload as TournamentInstanceEntity;
}

// Dependencias por defecto del "camino feliz": dueño existente y
// creación de la instancia global sin choque de nombre.
function makeDeps() {
  const getUserByIdUsecase = {
    call: jest.fn().mockResolvedValue(GottenUserDomainEvent(buildFakeOwner())),
  } as unknown as GetUserByIdUsecase;

  const createTournamentInstanceUsecase = {
    call: jest.fn().mockResolvedValue(TournamentInstanceSavedDomainEvent(buildFakeInstance())),
  } as unknown as CreateTournamentInstanceUsecase;

  return { getUserByIdUsecase, createTournamentInstanceUsecase };
}

function buildFakeTournament(): DomainEvent {
  return TournamentEntity.build({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    name: 'World Cup 2026',
    matchType: MatchType.SingleMatchPerRound,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-07-15'),
    token: 'tttttttt-tttt-tttt-tttt-tttttttttttt',
  })!;
}

function makeMockContract(overrides: Partial<Record<keyof TournamentContract, jest.Mock>> = {}) {
  return {
    save: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    modify: jest.fn(),
    getAll: jest.fn(),
    getByIDs: jest.fn(),
    filter: jest.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as TournamentContract;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreateTournamentUsecaseImpl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the tournament is saved successfully', () => {
    it('returns TournamentSavedDomainEvent with the saved entity', async () => {
      const saved = buildFakeTournament().payload;
      const contract = makeMockContract({
        save: jest.fn().mockResolvedValue(saved),
      });
      const { getUserByIdUsecase, createTournamentInstanceUsecase } = makeDeps();
      const usecase = new CreateTournamentUsecaseImpl(
        contract,
        createTournamentInstanceUsecase,
        getUserByIdUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(TournamentSavedDomainEvent)).toBe(true);
      expect(result.payload).toBe(saved);
    });
  });

  describe('when the contract fails to save', () => {
    it('returns TournamentNotSavedDomainEvent', async () => {
      const contract = makeMockContract({
        save: jest.fn().mockResolvedValue(null),
      });
      const { getUserByIdUsecase, createTournamentInstanceUsecase } = makeDeps();
      const usecase = new CreateTournamentUsecaseImpl(
        contract,
        createTournamentInstanceUsecase,
        getUserByIdUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(TournamentNotSavedDomainEvent)).toBe(true);
    });
  });

  describe('when the entity cannot be instantiated', () => {
    it('returns EntityNotInstanciableDomainEvent and skips save', async () => {
      jest.spyOn(TournamentEntity, 'build').mockReturnValueOnce(EntityNotInstanciableDomainEvent());
      const contract = makeMockContract();
      const { getUserByIdUsecase, createTournamentInstanceUsecase } = makeDeps();
      const usecase = new CreateTournamentUsecaseImpl(
        contract,
        createTournamentInstanceUsecase,
        getUserByIdUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(EntityNotInstanciableDomainEvent)).toBe(true);
      expect(contract.save).not.toHaveBeenCalled();
    });
  });
});
