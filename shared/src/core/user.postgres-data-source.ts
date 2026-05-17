import { DataSource } from "./data-source.interface";
import { DBClient, User } from "@skorify/data";
import { Id } from "@skorify/domain/core";
import { UserEntity } from "@skorify/domain/user";

export class UserPostgresDataSource implements DataSource<UserEntity> {
  constructor(private dbClient: DBClient) {}

  async read(): Promise<UserEntity[]> {
    const matches = await this.dbClient.users.findAllActive();
    return matches.map(this.toDomain);
  }

  async write(data: UserEntity[]): Promise<void> {
    // This implementation saves all entities
    for (const entity of data) {
      const dbUser = this.toDatabase(entity);
      console.log('Firccion ' , dbUser);
      
      await this.dbClient.users.create(dbUser);
    }
  }

  // Convert from database User to domain UserEntity
  private toDomain(dbUser: User): UserEntity {
    return UserEntity.build({
      id: dbUser.id as Id,
      createdAt: dbUser.created_at!,
      email: dbUser.email,
      notificationToken: "",
      name: dbUser.name,
      isActive: true,
      updatedAt: dbUser.updated_at == null ? undefined : dbUser.updated_at,
    });
  }

  // Convert from domain UserEntity to database User
  private toDatabase(entity: UserEntity): Partial<User> {
    return {
      id: entity.id,
      avatar_url: "",
      name: entity.name,
      email: entity.email,
      password_hash: "",
      role: "general",

      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
