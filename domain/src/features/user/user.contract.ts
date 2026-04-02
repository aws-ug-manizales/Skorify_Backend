import { UserEntity } from "./user.entity";

export abstract class UserContract {
  abstract getById(id: string): Promise<UserEntity | null>;
  abstract save(user: UserEntity): Promise<UserEntity | null>;
}
