import { UserEntity } from "@skorify/domain/user";
import { BaseRepository, DataSource } from "../core";

export class UserRepository extends BaseRepository<UserEntity> {
  constructor(ds: DataSource<UserEntity>) {
    super(ds);
  }
}
