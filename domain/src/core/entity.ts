export type Id = `${string}-${string}-${string}-${string}-${string}`;

export class Entity {
  protected id: Id;

  constructor(id: Id) {
    this.id = id;
  }
}
