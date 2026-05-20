"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentEntity = exports.MatchType = void 0;
const core_1 = require("../../core");
var MatchType;
(function (MatchType) {
    MatchType["SingleMatchPerRound"] = "single_match_per_round";
    MatchType["HomeAndAwayPerRound"] = "home_and_away_per_round";
})(MatchType || (exports.MatchType = MatchType = {}));
class TournamentEntity extends core_1.Entity {
    name;
    startDate;
    endDate;
    matchType;
    token;
    constructor(attributes) {
        const { id, name, startDate, endDate, matchType, token } = attributes;
        super(id, new Date());
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.matchType = matchType ?? MatchType.SingleMatchPerRound;
        this.token = token;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new TournamentEntity(params));
    }
}
exports.TournamentEntity = TournamentEntity;
