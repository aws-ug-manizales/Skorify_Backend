import { UserEnrollmentEntity } from '@skorify/domain/user-enrollment';
import { UserEnrollmentAttributes } from '../../../domain/dist/features/user-enrollment/user-enrollment.entity';
import { BaseRepository, DataSource } from '../core';
import { UserEnrollmentMapper } from '../mappers/user-enrollment.mappert';

export class UserEnrollmentRepository extends BaseRepository<
  UserEnrollmentEntity,
  UserEnrollmentAttributes
> {
  constructor(ds: DataSource<UserEnrollmentEntity>, mapper: UserEnrollmentMapper) {
    super(ds, mapper);
  }
}
