import { Entity } from "@skorify/domain/core";

/**
 * DataSource es la abstracción del origen de datos.
 * Define las operaciones básicas de lectura y escritura.
 *
 * Implementaciones posibles:
 * - InMemoryDataSource (Map en memoria)
 * - JsonDataSource (archivo JSON)
 * - DatabaseDataSource (PostgreSQL, MongoDB, DynamoDB, etc.)
 */
export interface DataSource<T extends Entity> {
  read(): Promise<T[]>;
  write(data: T[]): Promise<void>;
}
