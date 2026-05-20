"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchEntity = void 0;
const core_1 = require("../../core");
const entity_1 = require("../../core/entity");
const match_state_1 = require("./match.state");
class MatchEntity extends entity_1.Entity {
    tournamentId;
    awayTeamId;
    homeTeamId;
    kickOff;
    awayScore;
    homeScore;
    stage;
    venue;
    _status;
    _state;
    _timeToCloseInMinutes;
    constructor(attributes) {
        super(attributes.id, new Date());
        this.awayTeamId = attributes.awayTeamId;
        this.homeTeamId = attributes.homeTeamId;
        this.kickOff = attributes.kickOff;
        this.tournamentId = attributes.tournamentId;
        this._timeToCloseInMinutes = 10;
        this.awayScore = attributes.awayScore ?? 0;
        this.homeScore = attributes.homeScore ?? 0;
        this.stage = attributes.stage;
        this.venue = attributes.venue;
        this._status = attributes.status;
        this._state = match_state_1.matchStateCollection[attributes.status];
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new MatchEntity({
            ...params,
            status: params.status ?? match_state_1.MatchStatus.Draft,
        }));
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
        this._state = match_state_1.matchStateCollection[value];
    }
    get timeToCloseInMinutes() {
        return this._timeToCloseInMinutes;
    }
    canBet() {
        return this._state.canBet(this);
    }
    canEdit() {
        return this._state.canEdit(this);
    }
    canChangeTeams(hasPredictions) {
        return this._state.canChangeTeams(this, hasPredictions);
    }
    isMatchClose() {
        return this._state.isMatchClose(this);
    }
    setScores(awayScore, homeScore) {
        this.awayScore = awayScore;
        this.homeScore = homeScore;
    }
}
exports.MatchEntity = MatchEntity;
