import { IdentityProviderContract } from "@skorify/domain/user";

export class IdentityProviderMemoryImpl extends IdentityProviderContract {
  private users: Map<string, any> = new Map();

  async update(userId: string, data: any): Promise<void> {
    const currentData = this.users.get(userId) || {};
    this.users.set(userId, { ...currentData, ...data });
    console.log(`[IdentityProviderMemory] Updated user ${userId} with:`, data);
  }
}
