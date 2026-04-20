import { InverseResultRule } from "../../../src/features/prediction/scoreRules/inverse-result.rule";

describe("InverseResultRule", () => {
  it("returns 0 for draws (no inverse outcome)", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 1, localTeamScore: 1 },
      match: { awayTeamScore: 2, localTeamScore: 0 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when prediction outcome is inverse of the match outcome", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 0, localTeamScore: 2 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when prediction outcome is same as match outcome", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 0 },
      match: { awayTeamScore: 1, localTeamScore: 0 },
    });

    expect(score).toBe(0);
  });
});
