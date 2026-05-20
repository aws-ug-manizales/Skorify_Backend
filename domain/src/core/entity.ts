export type Id = `${string}-${string}-${string}-${string}-${string}`;

export interface BaseAttributes {
  id: Id;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
export class Entity {
  id: Id;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(id: Id, createdAt: Date) {
    this.id = id;
    this.createdAt = createdAt;
  }

  public getId(): Id {
    return this.id;
  }
}
