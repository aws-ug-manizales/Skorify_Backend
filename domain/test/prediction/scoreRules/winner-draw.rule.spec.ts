import { WinnerDrawRule } from "../../../src/features/prediction/scoreRules/winner-draw.rule";

describe("WinnerDrawRule", () => {
  it("returns 2 when prediction matches outcome (draw)", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 1, localTeamScore: 1 },
      match: { awayTeamScore: 0, localTeamScore: 0 },
    });

    expect(score).toBe(2);
  });

  it("returns 2 when prediction matches outcome (away wins)", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 1 },
      match: { awayTeamScore: 1, localTeamScore: 0 },
    });

    expect(score).toBe(2);
  });

  it("returns 0 when prediction does not match outcome", () => {
    const rule = new WinnerDrawRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 0, localTeamScore: 1 },
      match: { awayTeamScore: 2, localTeamScore: 0 },
    });

    expect(score).toBe(0);
  });
});
