import type { DomainEvent, Id } from "@skorify/domain/core";
import type { CreateMatchParam } from "@skorify/domain/match";
import {
  MatchAlreadyExistsInSameTournamentStageDomainEvent,
  MatchContract,
  MatchEntity,
  MatchNotSavedDomainEvent,
  MatchSavedDomainEvent,
  MatchTeamDoesNotExistDomainEvent,
  MatchTeamIsTheSameDomainEvent,
} from "@skorify/domain/match";
import {
  GetTeamByIdUsecase,
  GottenTeamDomainEvent,
  NotGottenTeamDomainEvent,
  TeamEntity,
} from "@skorify/domain/team";
import {
  GetTournamentByIdUsecase,
  GottenTournamentDomainEvent,
  MatchType,
  NotGottenTournamentDomainEvent,
  TournamentEntity,
} from "@skorify/domain/tournament";
import { CreateMatchUsecaseImpl } from "../../../../src/features/match/usecases/create-match.usecase-impl";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const homeTeamId = "11111111-1111-1111-1111-111111111111" as Id;
const awayTeamId = "22222222-2222-2222-2222-222222222222" as Id;
const tournamentId = "33333333-3333-3333-3333-333333333333" as Id;

const validParam: CreateMatchParam = {
  homeTeamId,
  awayTeamId,
  tournamentId,
  kickOff: new Date("2026-06-01T15:00:00Z"),
  stage: "group",
};

function buildFakeTournament(
  matchType: MatchType = MatchType.SingleMatchPerRound,
): DomainEvent {
  return TournamentEntity.build({
    id: tournamentId,
    name: "Champions League",
    matchType,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    token: "some-token-uuid",
  })!;
}

function buildFakeTeam(id: Id): DomainEvent {
  return TeamEntity.build({ id, name: "Team" })!;
}

function buildFakeMatch(): DomainEvent {
  return MatchEntity.build({
    id: "44444444-4444-4444-4444-444444444444",
    homeTeamId,
    awayTeamId,
    tournamentId,
    kickOff: new Date("2026-06-01T15:00:00Z"),
    createdAt: new Date(),
  });
}

function makeMockMatchContract(
  overrides: Partial<Record<keyof MatchContract, jest.Mock>> = {},
): MatchContract {
  return {
    save: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    modifyById: jest.fn(),
    getAll: jest.fn(),
    getByIDs: jest.fn(),
    filter: jest.fn().mockResolvedValue([]),
    ...overrides,
  } as unknown as MatchContract;
}

function makeGetTournamentUsecase(de: DomainEvent): GetTournamentByIdUsecase {
  return {
    call: jest.fn().mockResolvedValue(de),
  } as unknown as GetTournamentByIdUsecase;
}

function makeGetTeamUsecase(...results: DomainEvent[]): GetTeamByIdUsecase {
  const mock = jest.fn();
  results.forEach((r) => mock.mockResolvedValueOnce(r));
  return { call: mock } as unknown as GetTeamByIdUsecase;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CreateMatchUsecaseImpl", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("when homeTeamId and awayTeamId are the same", () => {
    it("returns MatchTeamIsTheSameDomainEvent without any further calls", async () => {
      const matchContract = makeMockMatchContract();
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(buildFakeTournament().payload),
      );
      const getTeamUsecase = makeGetTeamUsecase();
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call({
        ...validParam,
        awayTeamId: homeTeamId,
      });

      expect(result.is(MatchTeamIsTheSameDomainEvent)).toBe(true);
      expect(getTournamentUsecase.call).not.toHaveBeenCalled();
    });
  });

  describe("when the tournament does not exist", () => {
    it("propagates the tournament domain event", async () => {
      const notFoundDE = NotGottenTournamentDomainEvent();
      const matchContract = makeMockMatchContract();
      const getTournamentUsecase = makeGetTournamentUsecase(notFoundDE);
      const getTeamUsecase = makeGetTeamUsecase();
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result).toBe(notFoundDE);
    });
  });

  describe("when a team does not exist", () => {
    it("returns MatchTeamDoesNotExistDomainEvent when the home team is not found", async () => {
      const matchContract = makeMockMatchContract();
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(buildFakeTournament().payload),
      );
      const getTeamUsecase = makeGetTeamUsecase(
        NotGottenTeamDomainEvent(),
        GottenTeamDomainEvent(buildFakeTeam(awayTeamId).payload),
      );
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(MatchTeamDoesNotExistDomainEvent)).toBe(true);
    });

    it("returns MatchTeamDoesNotExistDomainEvent when the away team is not found", async () => {
      const matchContract = makeMockMatchContract();
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(buildFakeTournament().payload),
      );
      const getTeamUsecase = makeGetTeamUsecase(
        GottenTeamDomainEvent(buildFakeTeam(homeTeamId).payload),
        NotGottenTeamDomainEvent(),
      );
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(MatchTeamDoesNotExistDomainEvent)).toBe(true);
    });
  });

  describe("when the match already exists in the same tournament stage", () => {
    it("returns MatchAlreadyExistsInSameTournamentStageDomainEvent for a direct duplicate", async () => {
      const matchContract = makeMockMatchContract({
        filter: jest.fn().mockResolvedValue([buildFakeMatch()]),
      });
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(buildFakeTournament().payload),
      );
      const getTeamUsecase = makeGetTeamUsecase(
        GottenTeamDomainEvent(buildFakeTeam(homeTeamId).payload),
        GottenTeamDomainEvent(buildFakeTeam(awayTeamId).payload),
      );
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(
        result.is(MatchAlreadyExistsInSameTournamentStageDomainEvent),
      ).toBe(true);
    });

    it("returns MatchAlreadyExistsInSameTournamentStageDomainEvent for a reversed fixture in SingleMatchPerRound", async () => {
      const matchContract = makeMockMatchContract({
        filter: jest
          .fn()
          .mockResolvedValueOnce([]) // no direct duplicate
          .mockResolvedValueOnce([buildFakeMatch()]), // reversed fixture exists
      });
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(
          buildFakeTournament(MatchType.SingleMatchPerRound).payload,
        ),
      );
      const getTeamUsecase = makeGetTeamUsecase(
        GottenTeamDomainEvent(buildFakeTeam(homeTeamId).payload),
        GottenTeamDomainEvent(buildFakeTeam(awayTeamId).payload),
      );
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(
        result.is(MatchAlreadyExistsInSameTournamentStageDomainEvent),
      ).toBe(true);
    });
  });

  describe("when all validations pass", () => {
    function setupValidMocks(matchType = MatchType.SingleMatchPerRound) {
      const matchContract = makeMockMatchContract();
      const getTournamentUsecase = makeGetTournamentUsecase(
        GottenTournamentDomainEvent(buildFakeTournament(matchType).payload),
      );
      const getTeamUsecase = makeGetTeamUsecase(
        GottenTeamDomainEvent(buildFakeTeam(homeTeamId).payload),
        GottenTeamDomainEvent(buildFakeTeam(awayTeamId).payload),
      );
      return { matchContract, getTournamentUsecase, getTeamUsecase };
    }

    it("returns MatchSavedDomainEvent with the saved match", async () => {
      const { matchContract, getTournamentUsecase, getTeamUsecase } =
        setupValidMocks();
      const saved = buildFakeMatch();
      matchContract.save = jest.fn().mockResolvedValue(saved);
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(MatchSavedDomainEvent)).toBe(true);
      expect(result.payload).toBe(saved);
    });

    it("returns MatchNotSavedDomainEvent when the contract fails to save", async () => {
      const { matchContract, getTournamentUsecase, getTeamUsecase } =
        setupValidMocks();
      matchContract.save = jest.fn().mockResolvedValue(null);
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      const result = await usecase.call(validParam);

      expect(result.is(MatchNotSavedDomainEvent)).toBe(true);
    });

    it("does not check reversed fixtures when tournament allows HomeAndAwayPerRound", async () => {
      const { matchContract, getTournamentUsecase, getTeamUsecase } =
        setupValidMocks(MatchType.HomeAndAwayPerRound);
      const saved = buildFakeMatch();
      matchContract.save = jest.fn().mockResolvedValue(saved);
      const usecase = new CreateMatchUsecaseImpl(
        matchContract,
        getTournamentUsecase,
        getTeamUsecase,
      );

      await usecase.call(validParam);

      // Only the direct-duplicate filter should run; no reversed-fixture check
      expect(matchContract.filter).toHaveBeenCalledTimes(1);
    });
  });
});
