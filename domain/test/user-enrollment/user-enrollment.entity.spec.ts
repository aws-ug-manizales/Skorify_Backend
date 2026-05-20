import { UserEnrollmentEntity } from "../../src/features/user-enrollment/user-enrollment.entity";
import { Id } from "../../src/core/entity";

describe("UserEnrollmentEntity", () => {
  const enrollmentId = "11111111-1111-1111-1111-111111111111" as Id;
  const userId = "22222222-2222-2222-2222-222222222222" as Id;
  const tournamentInstanceId = "33333333-3333-3333-3333-333333333333" as Id;
  const tournamentId = "44444444-4444-4444-4444-444444444444" as Id;

  function createEnrollment(initialScore = 0, initialStreak = 0): UserEnrollmentEntity {
    const enrollmentDE = UserEnrollmentEntity.build({
      id: enrollmentId,
      userId,
      tournamentInstanceId,
      tournamentId,
      joinedAt: new Date(),
      lastPosition: 1,
      currentPosition: 1,
      currentScore: initialScore,
      streak: initialStreak,
      maxStreak: 0,
    });

    return (enrollmentDE as any).payload as UserEnrollmentEntity;
  }

  describe("applyScore", () => {
    it("should add points and increment streak when isExact is true", () => {
      const enrollment = createEnrollment(10, 2);
      
      enrollment.applyScore(5, true);

      expect(enrollment.currentScore).toBe(15);
      expect(enrollment.streak).toBe(3);
    });

    it("should add points and reset streak to 0 when isExact is false", () => {
      const enrollment = createEnrollment(10, 5);
      
      enrollment.applyScore(2, false);

      expect(enrollment.currentScore).toBe(12);
      expect(enrollment.streak).toBe(0);
    });

    it("should allow adding 0 points and still increment streak if exact", () => {
        const enrollment = createEnrollment(10, 0);
        
        enrollment.applyScore(0, true);
  
        expect(enrollment.currentScore).toBe(10);
        expect(enrollment.streak).toBe(1);
      });
  });

  describe("verifyMaxStreak", () => {
    it("should update maxStreak if current streak is greater", () => {
      const enrollment = createEnrollment(0, 5);
      (enrollment as any).maxStreak = 4;
      
      (enrollment as any).verifyMaxStreak();

      expect(enrollment.maxStreak).toBe(5);
    });

    it("should NOT update maxStreak if current streak is less or equal", () => {
      const enrollment = createEnrollment(0, 3);
      (enrollment as any).maxStreak = 5;
      
      (enrollment as any).verifyMaxStreak();

      expect(enrollment.maxStreak).toBe(5);
    });
  });

  describe("getStreakBonusPoints", () => {
    it("should return 0 when streak is 0", () => {
      const enrollment = createEnrollment(0, 0);
      expect(enrollment.getStreakBonusPoints()).toBe(0);
    });

    it("should return 1 when streak is 3", () => {
      const enrollment = createEnrollment(0, 3);
      expect(enrollment.getStreakBonusPoints()).toBe(1);
    });

    it("should return 2 when streak is 5", () => {
      const enrollment = createEnrollment(0, 5);
      expect(enrollment.getStreakBonusPoints()).toBe(2);
    });

    it("should return 3 when streak is 7", () => {
      const enrollment = createEnrollment(0, 7);
      expect(enrollment.getStreakBonusPoints()).toBe(3);
    });

    it("should return 4 when streak is 10", () => {
      const enrollment = createEnrollment(0, 10);
      expect(enrollment.getStreakBonusPoints()).toBe(4);
    });

    it("should return 0 for non-milestone streaks (e.g., 4)", () => {
        const enrollment = createEnrollment(0, 4);
        expect(enrollment.getStreakBonusPoints()).toBe(0);
      });
  });
});
