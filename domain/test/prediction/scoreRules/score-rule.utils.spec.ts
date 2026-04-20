import {
  goalDiff,
  outcome,
  isSameOutcome,
  isExactScore,
  isInverseOutcome,
  totalGoals,
} from "../../../src/features/prediction/scoreRules/score-rule.utils";

describe("score-rule.utils", () => {
  describe("goalDiff", () => {
    it("returns away-local difference", () => {
      expect(goalDiff({ awayTeamScore: 2, localTeamScore: 1 })).toBe(1);
      expect(goalDiff({ awayTeamScore: 0, localTeamScore: 3 })).toBe(-3);
      expect(goalDiff({ awayTeamScore: 1, localTeamScore: 1 })).toBe(0);
    });
  });

  describe("isExactScore", () => {
    it("returns true when both team scores match", () => {
      expect(
        isExactScore(
          { awayTeamScore: 2, localTeamScore: 1 },
          { awayTeamScore: 2, localTeamScore: 1 }
        )
      ).toBe(true);
    });

    it("returns false when any team score differs", () => {
      expect(
        isExactScore(
          { awayTeamScore: 2, localTeamScore: 1 },
          { awayTeamScore: 2, localTeamScore: 0 }
        )
      ).toBe(false);

      expect(
        isExactScore(
          { awayTeamScore: 2, localTeamScore: 1 },
          { awayTeamScore: 1, localTeamScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("outcome", () => {
    it("returns 1 when away wins", () => {
      expect(outcome({ awayTeamScore: 2, localTeamScore: 1 })).toBe(1);
    });

    it("returns -1 when local wins", () => {
      expect(outcome({ awayTeamScore: 0, localTeamScore: 1 })).toBe(-1);
    });

    it("returns 0 on draw", () => {
      expect(outcome({ awayTeamScore: 3, localTeamScore: 3 })).toBe(0);
    });
  });

  describe("isSameOutcome", () => {
    it("returns true for same winner regardless of exact score", () => {
      expect(
        isSameOutcome(
          { awayTeamScore: 2, localTeamScore: 0 },
          { awayTeamScore: 1, localTeamScore: 0 }
        )
      ).toBe(true);

      expect(
        isSameOutcome(
          { awayTeamScore: 0, localTeamScore: 1 },
          { awayTeamScore: 1, localTeamScore: 3 }
        )
      ).toBe(true);
    });

    it("returns true for draw vs draw", () => {
      expect(
        isSameOutcome(
          { awayTeamScore: 0, localTeamScore: 0 },
          { awayTeamScore: 2, localTeamScore: 2 }
        )
      ).toBe(true);
    });

    it("returns false for different outcomes", () => {
      expect(
        isSameOutcome(
          { awayTeamScore: 1, localTeamScore: 0 },
          { awayTeamScore: 0, localTeamScore: 1 }
        )
      ).toBe(false);

      expect(
        isSameOutcome(
          { awayTeamScore: 1, localTeamScore: 1 },
          { awayTeamScore: 2, localTeamScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("isInverseOutcome", () => {
    it("returns true when outcomes are inverse", () => {
      expect(
        isInverseOutcome(
          { awayTeamScore: 2, localTeamScore: 0 },
          { awayTeamScore: 0, localTeamScore: 2 }
        )
      ).toBe(true);
    });

    it("returns false when outcomes are same", () => {
      expect(
        isInverseOutcome(
          { awayTeamScore: 2, localTeamScore: 0 },
          { awayTeamScore: 3, localTeamScore: 1 }
        )
      ).toBe(false);
    });

    it("returns false when any outcome is a draw", () => {
      expect(
        isInverseOutcome(
          { awayTeamScore: 1, localTeamScore: 1 },
          { awayTeamScore: 0, localTeamScore: 2 }
        )
      ).toBe(false);

      expect(
        isInverseOutcome(
          { awayTeamScore: 0, localTeamScore: 2 },
          { awayTeamScore: 1, localTeamScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("totalGoals", () => {
    it("returns the sum of both teams goals", () => {
      expect(totalGoals({ awayTeamScore: 2, localTeamScore: 1 })).toBe(3);
      expect(totalGoals({ awayTeamScore: 0, localTeamScore: 0 })).toBe(0);
    });
  });
});
