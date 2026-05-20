"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const core_1 = require("../../core");
const entity_1 = require("../../core/entity");
class UserEntity extends entity_1.Entity {
    name;
    isActive = false;
    notificationToken;
    email;
    image;
    constructor(attributes) {
        const { id, name, notificationToken, email, image, isActive } = attributes;
        super(id, new Date());
        this.name = name;
        this.email = email;
        this.image = image;
        this.notificationToken = notificationToken;
        this.email = email;
        this.isActive = isActive;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new UserEntity(params));
    }
}
exports.UserEntity = UserEntity;
