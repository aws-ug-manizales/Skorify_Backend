import { WinnerDrawRule } from "../../../src/features/prediction/scoreRules/winner-draw.rule";

describe("WinnerDrawRule", () => {
  it("returns 2 when prediction matches outcome (draw)", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 1, homeScore: 1 },
      match: { awayScore: 0, homeScore: 0 },
    });

    expect(score).toBe(2);
  });

  it("returns 2 when prediction matches outcome (away wins)", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 1 },
      match: { awayScore: 1, homeScore: 0 },
    });

    expect(score).toBe(2);
  });

  it("returns 0 when prediction does not match outcome", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 0, homeScore: 1 },
      match: { awayScore: 2, homeScore: 0 },
    });

    expect(score).toBe(0);
  });
});
