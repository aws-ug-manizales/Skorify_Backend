"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentInstanceEntity = void 0;
const core_1 = require("../../core");
class TournamentInstanceEntity extends core_1.Entity {
    name;
    ownerId;
    tournamentId;
    state;
    inviteCode;
    constructor(attributes) {
        const { id, name, state, ownerId, tournamentId, inviteCode } = attributes;
        super(id, new Date());
        this.name = name;
        this.state = state;
        this.ownerId = ownerId;
        this.tournamentId = tournamentId;
        this.inviteCode = inviteCode;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new TournamentInstanceEntity(params));
    }
}
exports.TournamentInstanceEntity = TournamentInstanceEntity;
