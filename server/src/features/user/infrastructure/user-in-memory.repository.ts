import { UserContract, UserEntity } from "@skorify/domain/user";


export class UserInMemoryRepository extends UserContract {
  users: UserEntity[] = [
    {
      id: "3feb69ea-d146-4964-a007-233eb36dac82",
      name: "Bryan Arroyave",
    },
  ];
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
   const userExists = this.users.find((u) => u.id == user.id);
   if (userExists) {
     return Promise.resolve(userExists);
   }
   this.users.push(user);
   return Promise.resolve(user);
  }
}
