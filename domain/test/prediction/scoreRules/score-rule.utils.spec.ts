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
      expect(goalDiff({ awayScore: 2, homeScore: 1 })).toBe(1);
      expect(goalDiff({ awayScore: 0, homeScore: 3 })).toBe(-3);
      expect(goalDiff({ awayScore: 1, homeScore: 1 })).toBe(0);
    });
  });

  describe("isExactScore", () => {
    it("returns true when both team scores match", () => {
      expect(
        isExactScore(
          { awayScore: 2, homeScore: 1 },
          { awayScore: 2, homeScore: 1 }
        )
      ).toBe(true);
    });

    it("returns false when any team score differs", () => {
      expect(
        isExactScore(
          { awayScore: 2, homeScore: 1 },
          { awayScore: 2, homeScore: 0 }
        )
      ).toBe(false);

      expect(
        isExactScore(
          { awayScore: 2, homeScore: 1 },
          { awayScore: 1, homeScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("outcome", () => {
    it("returns 1 when away wins", () => {
      expect(outcome({ awayScore: 2, homeScore: 1 })).toBe(1);
    });

    it("returns -1 when local wins", () => {
      expect(outcome({ awayScore: 0, homeScore: 1 })).toBe(-1);
    });

    it("returns 0 on draw", () => {
      expect(outcome({ awayScore: 3, homeScore: 3 })).toBe(0);
    });
  });

  describe("isSameOutcome", () => {
    it("returns true for same winner regardless of exact score", () => {
      expect(
        isSameOutcome(
          { awayScore: 2, homeScore: 0 },
          { awayScore: 1, homeScore: 0 }
        )
      ).toBe(true);

      expect(
        isSameOutcome(
          { awayScore: 0, homeScore: 1 },
          { awayScore: 1, homeScore: 3 }
        )
      ).toBe(true);
    });

    it("returns true for draw vs draw", () => {
      expect(
        isSameOutcome(
          { awayScore: 0, homeScore: 0 },
          { awayScore: 2, homeScore: 2 }
        )
      ).toBe(true);
    });

    it("returns false for different outcomes", () => {
      expect(
        isSameOutcome(
          { awayScore: 1, homeScore: 0 },
          { awayScore: 0, homeScore: 1 }
        )
      ).toBe(false);

      expect(
        isSameOutcome(
          { awayScore: 1, homeScore: 1 },
          { awayScore: 2, homeScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("isInverseOutcome", () => {
    it("returns true when outcomes are inverse", () => {
      expect(
        isInverseOutcome(
          { awayScore: 2, homeScore: 0 },
          { awayScore: 0, homeScore: 2 }
        )
      ).toBe(true);
    });

    it("returns false when outcomes are same", () => {
      expect(
        isInverseOutcome(
          { awayScore: 2, homeScore: 0 },
          { awayScore: 3, homeScore: 1 }
        )
      ).toBe(false);
    });

    it("returns false when any outcome is a draw", () => {
      expect(
        isInverseOutcome(
          { awayScore: 1, homeScore: 1 },
          { awayScore: 0, homeScore: 2 }
        )
      ).toBe(false);

      expect(
        isInverseOutcome(
          { awayScore: 0, homeScore: 2 },
          { awayScore: 1, homeScore: 1 }
        )
      ).toBe(false);
    });
  });

  describe("totalGoals", () => {
    it("returns the sum of both teams goals", () => {
      expect(totalGoals({ awayScore: 2, homeScore: 1 })).toBe(3);
      expect(totalGoals({ awayScore: 0, homeScore: 0 })).toBe(0);
    });
  });
});
