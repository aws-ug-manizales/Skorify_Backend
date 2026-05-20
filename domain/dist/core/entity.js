"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    id;
    createdAt;
    updatedAt;
    deletedAt;
    constructor(id, createdAt) {
        this.id = id;
        this.createdAt = createdAt;
    }
    getId() {
        return this.id;
    }
}
exports.Entity = Entity;
