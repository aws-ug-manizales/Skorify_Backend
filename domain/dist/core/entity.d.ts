export type Id = `${string}-${string}-${string}-${string}-${string}`;
export interface BaseAttributes {
    id: Id;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
export declare class Entity {
    id: Id;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    constructor(id: Id, createdAt: Date);
    getId(): Id;
}
