import { InverseResultRule } from "../../../src/features/prediction/scoreRules/inverse-result.rule";

describe("InverseResultRule", () => {
  it("returns 0 for draws (no inverse outcome)", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 1, homeScore: 1 },
      match: { awayScore: 2, homeScore: 0 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when prediction outcome is inverse of the match outcome", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 0, homeScore: 2 },
      match: { awayScore: 3, homeScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when prediction outcome is same as match outcome", () => {
    const rule = new InverseResultRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 0 },
      match: { awayScore: 1, homeScore: 0 },
    });

    expect(score).toBe(0);
  });
});
