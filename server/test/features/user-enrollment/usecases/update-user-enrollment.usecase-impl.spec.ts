import { UpdateUserEnrollmentUsecaseImpl } from "../../../../src/features/user-enrollment/usecases/update-user-enrollment.usecase-impl";
import { 
  UserEnrollmentContract, 
  UserEnrollmentEntity,
  NotGottenUserEnrollmentDomainEvent,
  SavedUserEnrollmentDomainEvent
} from "@skorify/domain/user-enrollment";
import { Id } from "@skorify/domain/core";

describe("UpdateUserEnrollmentUsecaseImpl", () => {
  const enrollmentId = "11111111-1111-1111-1111-111111111111" as Id;

  function makeMockContract(enrollment: UserEnrollmentEntity | null): UserEnrollmentContract {
    return {
      getById: jest.fn().mockResolvedValue(enrollment),
      modifyById: jest.fn().mockImplementation((id: string, ent: UserEnrollmentEntity) => Promise.resolve(ent)),
      save: jest.fn(),
      deleteById: jest.fn(),
      getAll: jest.fn(),
      getByIDs: jest.fn(),
      filter: jest.fn(),
    } as unknown as UserEnrollmentContract;
  }

  function buildFakeEnrollment(): UserEnrollmentEntity {
    return UserEnrollmentEntity.build({
      id: enrollmentId,
      userId: "22222222-2222-2222-2222-222222222222" as Id,
      tournamentInstanceId: "33333333-3333-3333-3333-333333333333" as Id,
      tournamentId: "44444444-4444-4444-4444-444444444444" as Id,
      joinedAt: new Date(),
      lastPosition: 1,
      currentPosition: 1,
      currentScore: 10,
      streak: 2,
      maxStreak: 2,
    });
  }

  it("should update enrollment and return SavedUserEnrollmentDomainEvent", async () => {
    const enrollment = buildFakeEnrollment();
    const contract = makeMockContract(enrollment);
    const usecase = new UpdateUserEnrollmentUsecaseImpl(contract);

    const result = await usecase.call({
      userEnrollmentId: enrollmentId,
      points: 5,
      isExact: true,
    });

    expect(result.is(SavedUserEnrollmentDomainEvent)).toBe(true);
    expect(enrollment.currentScore).toBe(15);
    expect(enrollment.streak).toBe(3);
    expect(enrollment.maxStreak).toBe(3);
    expect(contract.modifyById).toHaveBeenCalledWith(enrollmentId, enrollment);
  });

  it("should return NotGottenUserEnrollmentDomainEvent if enrollment does not exist", async () => {
    const contract = makeMockContract(null);
    const usecase = new UpdateUserEnrollmentUsecaseImpl(contract);

    const result = await usecase.call({
      userEnrollmentId: enrollmentId,
      points: 5,
      isExact: true,
    });

    expect(result.is(NotGottenUserEnrollmentDomainEvent)).toBe(true);
    expect(contract.modifyById).not.toHaveBeenCalled();
  });
});
