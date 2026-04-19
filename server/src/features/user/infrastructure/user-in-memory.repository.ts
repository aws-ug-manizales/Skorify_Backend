import { UserContract, UserEntity } from "@skorify/domain/user";

export class UserInMemoryRepository extends UserContract {
  users: UserEntity[] = [
    UserEntity.build({
      id: "3feb69ea-d146-4964-a007-233eb36dac82",
      name: "Bryan Arroyave",
    }),
  ];
  constructor() {
    super();
  }

  async getById(id: string): Promise<UserEntity | null> {
    return this.users.find((u) => u.id == id) || null;
  }

  async save(user: UserEntity): Promise<UserEntity | null> {
    const userIndex = this.users.findIndex((u) => u.id == user.id);
    if (userIndex >= 0) {
      this.users[userIndex] = user;
      return Promise.resolve(user);
    }
    this.users.push(user);
    return Promise.resolve(user);
  }

  async deleteById(id: string): Promise<UserEntity | null> {
    const index = this.users.findIndex((u) => u.id == id);
    if (index < 0) {
      return null;
    }
    const [deleted] = this.users.splice(index, 1);
    return deleted;
  }

  async modifyById(id: string, entity: UserEntity): Promise<UserEntity | null> {
    const index = this.users.findIndex((u) => u.id == id);
    if (index < 0) {
      return null;
    }
    this.users[index] = entity;
    return entity;
  }

  async getAll(): Promise<UserEntity[]> {
    return [...this.users];
  }

  async getByIDs(ids: string[]): Promise<UserEntity[]> {
    return this.users.filter((u) => ids.includes(u.id));
  }

  async filter(filters: any): Promise<UserEntity[]> {
    return this.users;
  }
}
