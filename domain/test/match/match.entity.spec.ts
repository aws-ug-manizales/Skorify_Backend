import { MatchEntity } from "../../src/features/match/match.entity";
import { MatchStatus } from "../../src/features/match/match.state";
import type { Id } from "../../src/core/entity";

const matchId: Id = "11111111-2222-3333-4444-555555555555";
const awayTeamId: Id = "aaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const homeTeamId: Id = "fffffff-aaaa-bbbb-cccc-dddddddddddd";
const tournamentId: Id = "tttttttt-tttt-tttt-tttt-tttttttttttt";

const FUTURE_KICKOFF = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
const CLOSE_KICKOFF = new Date(Date.now() + 3 * 60 * 1000);        // 3 min from now (within 10-min window)
const FAR_FUTURE_KICKOFF = new Date("2030-01-01T12:00:00Z");

function buildMatch(status: MatchStatus, kickOff: Date = FAR_FUTURE_KICKOFF): MatchEntity {
  const matchDE = MatchEntity.build({
    id: matchId,
    awayTeamId,
    homeTeamId,
    tournamentId,
    kickOff,
    createdAt: new Date(),
    status,
  });

  return (matchDE as any).payload as MatchEntity;
}

// ---------------------------------------------------------------------------
// build()
// ---------------------------------------------------------------------------
describe("MatchEntity – build()", () => {
  it("defaults to Draft status when no status is provided", () => {
    const matchDE = MatchEntity.build({
      id: matchId,
      awayTeamId,
      homeTeamId,
      tournamentId,
      kickOff: FAR_FUTURE_KICKOFF,
      createdAt: new Date(),
    });

    const match = (matchDE as any).payload as MatchEntity;
    expect(match.status).toBe(MatchStatus.Draft);
  });

  it("initialises homeScore and awayScore to 0", () => {
    const match = buildMatch(MatchStatus.Draft);

    expect(match.homeScore).toBe(0);
    expect(match.awayScore).toBe(0);
  });

  it("stores the provided IDs and kickOff correctly", () => {
    const match = buildMatch(MatchStatus.Scheduled, FUTURE_KICKOFF);

    expect(match.id).toBe(matchId);
    expect(match.homeTeamId).toBe(homeTeamId);
    expect(match.awayTeamId).toBe(awayTeamId);
    expect(match.tournamentId).toBe(tournamentId);
    expect(match.kickOff).toEqual(FUTURE_KICKOFF);
  });
});

// ---------------------------------------------------------------------------
// canEdit()
// ---------------------------------------------------------------------------
describe("MatchEntity – canEdit()", () => {
  it.each([
    [MatchStatus.Draft, true],
    [MatchStatus.Scheduled, true],
    [MatchStatus.InProgress, false],
    [MatchStatus.Finished, false],
    [MatchStatus.Cancelled, false],
  ])("status %s → canEdit = %s", (status, expected) => {
    expect(buildMatch(status).canEdit()).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// canBet()
// ---------------------------------------------------------------------------
describe("MatchEntity – canBet()", () => {
  it("Draft: always allows betting regardless of kickOff time", () => {
    expect(buildMatch(MatchStatus.Draft, CLOSE_KICKOFF).canBet()).toBe(true);
    expect(buildMatch(MatchStatus.Draft, FAR_FUTURE_KICKOFF).canBet()).toBe(true);
  });

  it("Scheduled: allows betting when kickOff is more than 10 minutes away", () => {
    expect(buildMatch(MatchStatus.Scheduled, FUTURE_KICKOFF).canBet()).toBe(true);
  });

  it("Scheduled: disallows betting when kickOff is within 10 minutes", () => {
    expect(buildMatch(MatchStatus.Scheduled, CLOSE_KICKOFF).canBet()).toBe(false);
  });

  it.each([MatchStatus.InProgress, MatchStatus.Finished, MatchStatus.Cancelled])(
    "status %s → canBet = false",
    (status) => {
      expect(buildMatch(status, FUTURE_KICKOFF).canBet()).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// canChangeTeams()
// ---------------------------------------------------------------------------
describe("MatchEntity – canChangeTeams()", () => {
  it("Draft with no predictions → allows team changes", () => {
    expect(buildMatch(MatchStatus.Draft).canChangeTeams(false)).toBe(true);
  });

  it("Draft with existing predictions → disallows team changes", () => {
    expect(buildMatch(MatchStatus.Draft).canChangeTeams(true)).toBe(false);
  });

  it("Scheduled with no predictions → allows team changes", () => {
    expect(buildMatch(MatchStatus.Scheduled).canChangeTeams(false)).toBe(true);
  });

  it("Scheduled with existing predictions → disallows team changes", () => {
    expect(buildMatch(MatchStatus.Scheduled).canChangeTeams(true)).toBe(false);
  });

  it.each([MatchStatus.InProgress, MatchStatus.Finished, MatchStatus.Cancelled])(
    "status %s → canChangeTeams = false regardless of predictions",
    (status) => {
      expect(buildMatch(status).canChangeTeams(false)).toBe(false);
      expect(buildMatch(status).canChangeTeams(true)).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// isMatchClose()
// ---------------------------------------------------------------------------
describe("MatchEntity – isMatchClose()", () => {
  it("Draft: returns false when kickOff is far in the future", () => {
    expect(buildMatch(MatchStatus.Draft, FAR_FUTURE_KICKOFF).isMatchClose()).toBe(false);
  });

  it("Draft: returns true when kickOff is within the closing window", () => {
    expect(buildMatch(MatchStatus.Draft, CLOSE_KICKOFF).isMatchClose()).toBe(true);
  });

  it("Scheduled: returns false when kickOff is far in the future", () => {
    expect(buildMatch(MatchStatus.Scheduled, FAR_FUTURE_KICKOFF).isMatchClose()).toBe(false);
  });

  it("Scheduled: returns true when kickOff is within the closing window", () => {
    expect(buildMatch(MatchStatus.Scheduled, CLOSE_KICKOFF).isMatchClose()).toBe(true);
  });

  it.each([MatchStatus.InProgress, MatchStatus.Finished, MatchStatus.Cancelled])(
    "status %s → isMatchClose = true always",
    (status) => {
      expect(buildMatch(status, FAR_FUTURE_KICKOFF).isMatchClose()).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// setScores()
// ---------------------------------------------------------------------------
describe("MatchEntity – setScores()", () => {
  it("updates awayScore and homeScore", () => {
    const match = buildMatch(MatchStatus.Finished);
    match.setScores(2, 3);

    expect(match.awayScore).toBe(2);
    expect(match.homeScore).toBe(3);
  });

  it("allows setting scores to zero", () => {
    const match = buildMatch(MatchStatus.Finished);
    match.setScores(1, 1);
    match.setScores(0, 0);

    expect(match.awayScore).toBe(0);
    expect(match.homeScore).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// status setter (state transition)
// ---------------------------------------------------------------------------
describe("MatchEntity – status setter", () => {
  it("transitions from Scheduled to InProgress, disabling edit and betting", () => {
    const match = buildMatch(MatchStatus.Scheduled, FUTURE_KICKOFF);
    expect(match.canEdit()).toBe(true);

    match.status = MatchStatus.InProgress;

    expect(match.status).toBe(MatchStatus.InProgress);
    expect(match.canEdit()).toBe(false);
    expect(match.canBet()).toBe(false);
  });

  it("transitions from InProgress to Finished", () => {
    const match = buildMatch(MatchStatus.InProgress);
    match.status = MatchStatus.Finished;

    expect(match.status).toBe(MatchStatus.Finished);
    expect(match.canEdit()).toBe(false);
  });
});
