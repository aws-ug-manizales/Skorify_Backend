import { ExactScoreRule } from "../../../src/features/prediction/scoreRules/exact-score.rule";

describe("ExactScoreRule", () => {
  it("returns 1 when the scoreline is exactly correct", () => {
    const rule = new ExactScoreRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 1 },
      match: { awayTeamScore: 2, localTeamScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when any side score differs", () => {
    const rule = new ExactScoreRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 1 },
      match: { awayTeamScore: 2, localTeamScore: 2 },
    });

    expect(score).toBe(0);
  });
});
