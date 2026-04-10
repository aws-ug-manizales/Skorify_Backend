import { UserContract, UserEntity } from "@skorify/domain/user";

export class UserAWSRepository extends UserContract {
  users: UserEntity[] = [];
  constructor() {
    super();
  }

  async getById(id: string): Promise<UserEntity | null> {
    const response = this.users.find((u) => u.id == id);

    if (!response) {
      return null;
    }
    return response;
  }
  save(user: UserEntity): Promise<UserEntity | null> {
    throw new Error("Method not implemented.");
  }
}
