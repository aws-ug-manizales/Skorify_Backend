import { BaseContract } from "../../core";
import { UserEnrollmentEntity } from "./user-enrollment.entity";

export abstract class UserEnrollmentContract extends BaseContract<UserEnrollmentEntity> {
  abstract getById(id: string): Promise<UserEnrollmentEntity | null>;
  abstract save(userEnrollment: UserEnrollmentEntity): Promise<UserEnrollmentEntity | null>;
}