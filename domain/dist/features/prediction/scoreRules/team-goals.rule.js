"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamGoalsRule = void 0;
class TeamGoalsRule {
    ruleScore = 1;
    getRuleScore() {
        return this.ruleScore;
    }
    getRuleName() {
        return TeamGoalsRule.name;
    }
    calculateScore(context) {
        let score = 0;
        if (context.prediction.awayScore === context.match.awayScore
            || context.prediction.homeScore === context.match.homeScore) {
            score += this.ruleScore;
        }
        return score;
    }
}
exports.TeamGoalsRule = TeamGoalsRule;
