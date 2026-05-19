import { TeamGoalsRule } from "../../../src/features/prediction/scoreRules/team-goals.rule";

describe("TeamGoalsRule", () => {
  it("returns 0 when no team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 0, homeScore: 0 },
      match: { awayScore: 2, homeScore: 1 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when away team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 0 },
      match: { awayScore: 2, homeScore: 3 },
    });

    expect(score).toBe(1);
  });

  it("returns 1 when local team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 0, homeScore: 3 },
      match: { awayScore: 2, homeScore: 3 },
    });

    expect(score).toBe(1);
  });

  it("returns 2 when both team goals match", () => {
    const rule = new TeamGoalsRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 3 },
      match: { awayScore: 2, homeScore: 3 },
    });

    expect(score).toBe(1);
  });
});
