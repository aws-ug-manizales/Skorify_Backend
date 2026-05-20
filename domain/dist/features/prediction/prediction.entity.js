"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionEntity = void 0;
const core_1 = require("../../core");
const entity_1 = require("../../core/entity");
const scoreRules_1 = require("./scoreRules");
const prediction_score_ruleset_1 = require("./scoreRules/prediction-score.ruleset");
class PredictionEntity extends entity_1.Entity {
    userId;
    userEnrollmentId;
    tournamentInstanceId;
    matchId;
    awayScore;
    homeScore;
    earnedPoints;
    hasExactResult;
    constructor(attributes) {
        super(attributes.id, new Date());
        this.userId = attributes.userId;
        this.userEnrollmentId = attributes.userEnrollmentId;
        this.tournamentInstanceId = attributes.tournamentInstanceId;
        this.matchId = attributes.matchId;
        this.awayScore = attributes.awayScore;
        this.homeScore = attributes.homeScore;
        this.earnedPoints = attributes.earnedPoints ?? 0;
        this.hasExactResult = attributes.hasExactResult;
    }
    static build(params) {
        return (0, core_1.BuiltEntityDomainEvent)(new PredictionEntity(params));
    }
    static forSimulation(params) {
        return new PredictionEntity({
            id: this.generateEmptyId(),
            userId: this.generateEmptyId(),
            userEnrollmentId: this.generateEmptyId(),
            tournamentInstanceId: this.generateEmptyId(),
            matchId: this.generateEmptyId(),
            homeScore: params.homeScore,
            awayScore: params.awayScore,
            earnedPoints: 0,
            hasExactResult: false,
        });
    }
    calculateScore(matchAwayScore, matchHomeScore, streakBonusPoints) {
        const ruleset = prediction_score_ruleset_1.PredictionScoreRuleset.default();
        const result = ruleset.calculateWithBreakdown({
            prediction: {
                awayScore: this.awayScore,
                homeScore: this.homeScore,
            },
            match: {
                awayScore: matchAwayScore,
                homeScore: matchHomeScore,
            },
        });
        this.setHasExactResult(result.breakdown);
        this.earnedPoints = result.total;
        if (streakBonusPoints > 0 && this.hasExactResult) {
            result.breakdown.push({ points: streakBonusPoints, rule: "StreakBonusPoints" });
            this.earnedPoints += streakBonusPoints;
        }
        return result;
    }
    setHasExactResult(rulesApplied) {
        this.hasExactResult = !!rulesApplied.find((r) => r.rule == scoreRules_1.ExactScoreRule.name);
    }
    static generateEmptyId() {
        return "0-0-0-0-0";
    }
}
exports.PredictionEntity = PredictionEntity;
