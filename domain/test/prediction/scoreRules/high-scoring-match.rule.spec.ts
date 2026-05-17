import { HighScoringMatchRule } from "../../../src/features/prediction/scoreRules/high-scoring-match.rule";

describe("HighScoringMatchRule", () => {
  it("returns 0 when match has less than 4 total goals", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 2, homeScore: 1 },
      match: { awayScore: 1, homeScore: 1 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when match has 4+ goals and prediction matches exact score", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 3, homeScore: 1 },
      match: { awayScore: 3, homeScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when match has 4+ goals but prediction is not exact", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayScore: 4, homeScore: 0 },
      match: { awayScore: 3, homeScore: 1 },
    });

    expect(score).toBe(0);
  });
});
