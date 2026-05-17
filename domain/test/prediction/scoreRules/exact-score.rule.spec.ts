import { ExactScoreRule } from "../../../src/features/prediction/scoreRules/exact-score.rule";

describe("ExactScoreRule", () => {
  it("returns 1 when the scoreline is exactly correct", () => {
    const rule = new ExactScoreRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 1 },
      match: { awayScore: 2, homeScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when any side score differs", () => {
    const rule = new ExactScoreRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 1 },
      match: { awayScore: 2, homeScore: 2 },
    });

    expect(score).toBe(0);
  });
});
