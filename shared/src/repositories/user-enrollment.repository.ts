import { UserEnrollmentEntity } from "@skorify/domain/user-enrollment";
import { BaseRepository, DataSource } from "../core";


export class UserEnrollmentRepository extends BaseRepository<UserEnrollmentEntity> {
  constructor(ds: DataSource<UserEnrollmentEntity>) {
    super(ds);
  }
}