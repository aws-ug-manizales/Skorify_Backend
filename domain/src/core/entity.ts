export type Id = `${string}-${string}-${string}-${string}-${string}`;

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
