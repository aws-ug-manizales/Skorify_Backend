"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamEntity = void 0;
const core_1 = require("../../core");
const entity_1 = require("../../core/entity");
class TeamEntity extends entity_1.Entity {
    name;
    shieldUrl;
    constructor(params) {
        super(params.id, new Date());
        this.name = params.name;
        this.shieldUrl = params.shieldUrl;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new TeamEntity(params));
    }
}
exports.TeamEntity = TeamEntity;
