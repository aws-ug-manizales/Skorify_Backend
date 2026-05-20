import { BaseContract, BuiltEntityDomainEvent, Entity, Filters } from '@skorify/domain/core';
import { BaseMapper } from './base.mapper';
import { DataSource } from './data-source.interface';

/**
 * BaseRepository implementa las operaciones CRUD del BaseContract.
 * Recibe un DataSource que define de dónde vienen los datos (JSON, DB, etc.)
 */
export class BaseRepository<T extends Entity, Attrs> extends BaseContract<T> {
  constructor(
    protected dataSource: DataSource<T>,
    protected mapper: BaseMapper<Attrs>,
  ) {
    super();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.dataSource.read();
    const temp = items.find((item) => item.id === id);
    if (temp != null) {
      const mapped = this.mapper.fromJson(temp ?? null);

      return mapped.is(BuiltEntityDomainEvent) ? (mapped.payload as T) : null;
    }
    return null;
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
    const items = await this.dataSource.read();

    const normalizedWhere = Array.isArray(filters.where)
      ? filters.where
      : Object.entries(filters.where).map(([attribute, value]) => {
          if (typeof value === 'object' && value !== null && 'type' in value && 'value' in value) {
            return {
              attribute,
              type: value.type,
              value: value.value,
            };
          }

          return {
            attribute,
            type: 'equals',
            value,
          };
        });

    let result = items.filter((entity) => {
      return normalizedWhere.every((where) => {
        const entityValue = (entity as Record<string, any>)[where.attribute];

        switch (where.type) {
          case 'equals':
            return entityValue === where.value;

          case 'like':
            return String(entityValue).toLowerCase().includes(String(where.value).toLowerCase());

          case 'moreThan':
            return entityValue > (where.value ?? 0);

          case 'lessThan':
            return entityValue < (where.value ?? 0);

          case 'in':
            return Array.isArray(where.value) ? where.value.includes(entityValue) : false;

          default:
            return false;
        }
      });
    });

    if (filters.order) {
      result = result.sort((a, b) => {
        for (const [column, direction] of Object.entries(filters.order!)) {
          const aValue = (a as Record<string, any>)[column];
          const bValue = (b as Record<string, any>)[column];

          if (aValue > bValue) {
            return direction === 'ASC' ? 1 : -1;
          }

          if (aValue < bValue) {
            return direction === 'ASC' ? -1 : 1;
          }
        }

        return 0;
      });
    }

    if (filters.skip !== undefined) {
      result = result.slice(filters.skip);
    }

    if (filters.take !== undefined) {
      result = result.slice(0, filters.take);
    }

    return result;
  }
}
