import { HighScoringMatchRule } from "../../../src/features/prediction/scoreRules/high-scoring-match.rule";

describe("HighScoringMatchRule", () => {
  it("returns 0 when match has less than 4 total goals", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 2, localTeamScore: 1 },
      match: { awayTeamScore: 1, localTeamScore: 1 },
    });

    expect(score).toBe(0);
  });

  it("returns 1 when match has 4+ goals and prediction matches exact score", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 3, localTeamScore: 1 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
    });

    expect(score).toBe(1);
  });

  it("returns 0 when match has 4+ goals but prediction is not exact", () => {
    const rule = new HighScoringMatchRule();

    const score = rule.calculateScore({
      prediction: { awayTeamScore: 4, localTeamScore: 0 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
    });

    expect(score).toBe(0);
  });
});
