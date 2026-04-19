import { MatchEntity, MatchStatus } from "../../src/features/match/match.entity";

describe("MatchEntity edit rules", () => {
  const matchId = "11111111-2222-3333-4444-555555555555";

  it("should not allow editing when the match is in progress", () => {
    const match = MatchEntity.build({
      id: matchId,
      awayTeamId: "away-team",
      localTeamId: "local-team",
      date: new Date("2027-10-15T15:00:00Z"),
      status: MatchStatus.InProgress,
    });

    expect(match.canEdit()).toBe(false);
  });

  it("should allow editing when the match is not in progress", () => {
    const match = MatchEntity.build({
      id: matchId,
      awayTeamId: "away-team",
      localTeamId: "local-team",
      date: new Date("2027-10-15T15:00:00Z"),
      status: MatchStatus.Scheduled,
    });

    expect(match.canEdit()).toBe(true);
  });

  it("should not allow team changes when there are existing predictions", () => {
    const match = MatchEntity.build({
      id: matchId,
      awayTeamId: "away-team",
      localTeamId: "local-team",
      date: new Date("2027-10-15T15:00:00Z"),
      status: MatchStatus.Scheduled,
    });

    expect(match.canChangeTeams(true)).toBe(false);
  });

  it("should allow team changes when no predictions exist", () => {
    const match = MatchEntity.build({
      id: matchId,
      awayTeamId: "away-team",
      localTeamId: "local-team",
      date: new Date("2027-10-15T15:00:00Z"),
      status: MatchStatus.Scheduled,
    });

    expect(match.canChangeTeams(false)).toBe(true);
  });
});
