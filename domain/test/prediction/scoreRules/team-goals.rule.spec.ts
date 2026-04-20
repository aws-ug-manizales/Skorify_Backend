import { TeamGoalsRule } from "../../../src/features/prediction/scoreRules/team-goals.rule";

describe("TeamGoalsRule", () => {
  it("returns 0 when no team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 0, localTeamScore: 0 },
      match: { awayTeamScore: 2, localTeamScore: 1 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when away team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 0 },
      match: { awayTeamScore: 2, localTeamScore: 3 },
    });

    expect(score).toBe(1);
  });

  it("returns 1 when local team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 0, localTeamScore: 3 },
      match: { awayTeamScore: 2, localTeamScore: 3 },
    });

    expect(score).toBe(1);
  });

  it("returns 2 when both team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 3 },
      match: { awayTeamScore: 2, localTeamScore: 3 },
    });

    expect(score).toBe(1);
  });
});
