import { Entity } from './entity';
import { Filters } from './filters';
export declare abstract class BaseContract<T extends Entity> {
    abstract getById(id: string): Promise<T | null>;
    abstract save(entity: T): Promise<T | null>;
    abstract deleteById(id: string): Promise<T | null>;
    abstract modifyById(id: string, entity: T): Promise<T | null>;
    abstract getAll(): Promise<T[]>;
    abstract getByIDs(ids: string[]): Promise<T[]>;
    abstract filter(filters: Filters): Promise<T[]>;
}
