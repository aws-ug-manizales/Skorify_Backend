import { Entity } from "./entity";

// BaseContract es una clase abstracta que define los métodos básicos para manejar entidades en el dominio.
// Recibe un tipo genérico T que extiende de Entity, lo que permite que cualquier clase que implemente BaseContract pueda trabajar con cualquier tipo de entidad que tenga un id.
export abstract class BaseContract<T extends Entity> {
  abstract getById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T  | null>;
  abstract deleteById(id: string): Promise<T | null>;
  abstract modifyById(id: string, entity: T): Promise<T | null>;
  abstract getAll(): Promise<T[]>;
  abstract getByIDs(ids: string[]): Promise<T[]>;
  //Definir como va a ser la implementacion de los filtros
  //abstract filter(filters: T[]): Promise<T[]>;
}
