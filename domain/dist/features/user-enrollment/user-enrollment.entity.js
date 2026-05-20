"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEnrollmentEntity = void 0;
const core_1 = require("../../core");
const entity_1 = require("../../core/entity");
const streakBonusRules = new Map();
streakBonusRules.set(3, 1);
streakBonusRules.set(5, 2);
streakBonusRules.set(7, 3);
streakBonusRules.set(10, 4);
class UserEnrollmentEntity extends entity_1.Entity {
    userId;
    tournamentInstanceId;
    tournamentId;
    joinedAt;
    lastPosition;
    currentPosition;
    currentScore;
    streak;
    maxStreak;
    constructor(attributes) {
        const { id, userId, tournamentInstanceId, tournamentId, joinedAt, lastPosition, currentPosition, currentScore, streak, maxStreak, } = attributes;
        super(id, new Date());
        this.userId = userId;
        this.tournamentInstanceId = tournamentInstanceId;
        this.tournamentId = tournamentId;
        this.joinedAt = joinedAt;
        this.lastPosition = lastPosition;
        this.currentPosition = currentPosition;
        this.currentScore = currentScore;
        this.streak = streak;
        this.maxStreak = maxStreak;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new UserEnrollmentEntity(params));
    }
    static forSimulation({ streak }) {
        return (0, core_1.BuiltEntityDomainEvent)(new UserEnrollmentEntity({
            id: '0-0-0-0-0',
            userId: '0-0-0-0-0',
            tournamentInstanceId: '0-0-0-0-0',
            tournamentId: '0-0-0-0-0',
            joinedAt: new Date(),
            lastPosition: null,
            currentPosition: null,
            currentScore: 0,
            streak,
            maxStreak: 0,
        }));
    }
    getStreakBonusPoints() {
        return streakBonusRules.get(this.streak) ?? 0;
    }
    static getStreakBonusRules() {
        return streakBonusRules;
    }
    applyScore(points, isExact) {
        this.currentScore += points;
        if (isExact) {
            this.streak += 1;
        }
        else {
            this.streak = 0;
        }
        this.verifyMaxStreak();
    }
    verifyMaxStreak() {
        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
        }
    }
    static generateEmptyId() {
        return "0-0-0-0-0";
    }
}
exports.UserEnrollmentEntity = UserEnrollmentEntity;
