import { DomainEvent, EntityNotInstanciableDomainEvent } from '@skorify/domain/core';
import type { CreateTournamentParam } from '@skorify/domain/tournament';
import {
  MatchType,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from '@skorify/domain/tournament';
import { CreateTournamentUsecaseImpl } from '../../../../src/features/tournament/usecases/create-tournament.usecase-impl';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validParam: CreateTournamentParam = {
  name: 'World Cup 2026',
  matchType: MatchType.SingleMatchPerRound,
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-07-15'),
};

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
    modifyById: jest.fn(),
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
      const usecase = new CreateTournamentUsecaseImpl(contract);

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
      const usecase = new CreateTournamentUsecaseImpl(contract);

      const result = await usecase.call(validParam);

      expect(result.is(TournamentNotSavedDomainEvent)).toBe(true);
    });
  });

  describe('when the entity cannot be instantiated', () => {
    it('returns EntityNotInstanciableDomainEvent and skips save', async () => {
      jest.spyOn(TournamentEntity, 'build').mockReturnValueOnce(EntityNotInstanciableDomainEvent());
      const contract = makeMockContract();
      const usecase = new CreateTournamentUsecaseImpl(contract);

      const result = await usecase.call(validParam);

      expect(result.is(EntityNotInstanciableDomainEvent)).toBe(true);
      expect(contract.save).not.toHaveBeenCalled();
    });
  });
});
