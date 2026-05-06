import { BaseContract, Id } from "@skorify/domain/core";
import { Entity } from "@skorify/domain/core";

export class {{ENTITY}}Repository<T extends Entity> extends BaseContract<any> {
  private store = new Map<string, T>();

  async getById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null;
  }

  async save(entity: T): Promise<T> {
    this.store.set(entity.getId(), entity);
    return entity;
  }

  async deleteById(id: string): Promise<T | null> {
    const tem = await this.getById(id);
    this.store.delete(id);
    return tem;
  }

  async modifyById(id: string, entity: T): Promise<T | null> {
    if (!this.store.has(id)) return null;
    const updated = { ...entity, id };
    this.store.set(id, updated);
    return updated;
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async getByIDs(ids: string[]): Promise<T[]> {
    return ids
      .map((id) => this.store.get(id))
      .filter((x): x is T => x !== undefined);
  }

  async filter(filters: Partial<T>): Promise<T[]> {
    const entries = Array.from(this.store.values());
    return entries.filter((entity) =>
      Object.entries(filters).every(
        ([key, value]) => (entity as any)[key] === value,
      ),
    );
  }
}
