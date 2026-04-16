import { UserEntity } from "./user.entity";
import { BaseContract } from "../../core";

export abstract class UserContract extends BaseContract<UserEntity> {
  abstract getById(id: string): Promise<UserEntity | null>;
  abstract save(user: UserEntity): Promise<UserEntity | null>;
}
