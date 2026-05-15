import { BaseContract, Entity, Filters } from "@skorify/domain/core";
import { DataSource } from "./data-source.interface";

/**
 * BaseRepository implementa las operaciones CRUD del BaseContract.
 * Recibe un DataSource que define de dónde vienen los datos (JSON, DB, etc.)
 */
export class BaseRepository<T extends Entity> extends BaseContract<T> {
  constructor(protected dataSource: DataSource<T>) {
    super();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.dataSource.read();
    return items.find((item) => item.id === id) ?? null;
  }

  async save(entity: T): Promise<T | null> {
    const items = await this.dataSource.read();
    const exists = items.findIndex((item) => item.id === entity.id);

    if (exists >= 0) {
      items[exists] = entity;
    } else {
      items.push(entity);
    }

    await this.dataSource.write(items);
    return entity;
  }

  async deleteById(id: string): Promise<T | null> {
    const items = await this.dataSource.read();
    const entity = items.find((item) => item.id === id);

    if (!entity) return null;

    const filtered = items.filter((item) => item.id !== id);
    await this.dataSource.write(filtered);
    return entity;
  }

  async modifyById(id: string, entity: T): Promise<T | null> {
    const items = await this.dataSource.read();
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) return null;

    const updated = { ...entity, id } as T;
    items[index] = updated;
    await this.dataSource.write(items);
    return updated;
  }

  async getAll(): Promise<T[]> {
    return this.dataSource.read();
  }

  async getByIDs(ids: string[]): Promise<T[]> {
    const items = await this.dataSource.read();
    return items.filter((item) => ids.includes(item.id));
  }

  async filter(filters: Filters): Promise<T[]> {
    const where = filters.where

    const items = await this.dataSource.read();
    return items.filter((entity) =>
      Object.entries(where).every(
        ([key, value]) => (entity as Record<string, unknown>)[key] === value,
      ),
    );
  }
}
