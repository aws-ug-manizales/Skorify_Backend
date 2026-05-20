"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighScoringMatchRule = void 0;
const score_rule_utils_1 = require("./score-rule.utils");
class HighScoringMatchRule {
    ruleScore = 1;
    threshold = 4;
    getRuleScore() {
        return this.ruleScore;
    }
    getRuleName() {
        return HighScoringMatchRule.name;
    }
    calculateScore(context) {
        if (this.isHighScoringMatch(context.match) && (0, score_rule_utils_1.isExactScore)(context.prediction, context.match)) {
            return this.ruleScore;
        }
        return 0;
    }
    isHighScoringMatch(match) {
        return (0, score_rule_utils_1.totalGoals)(match) >= this.threshold;
    }
}
exports.HighScoringMatchRule = HighScoringMatchRule;
