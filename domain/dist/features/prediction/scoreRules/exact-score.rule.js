"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExactScoreRule = void 0;
const score_rule_utils_1 = require("./score-rule.utils");
class ExactScoreRule {
    ruleScore = 1;
    getRuleScore() {
        return this.ruleScore;
    }
    getRuleName() {
        return ExactScoreRule.name;
    }
    calculateScore(context) {
        if ((0, score_rule_utils_1.isExactScore)(context.prediction, context.match)) {
            return this.ruleScore;
        }
        return 0;
    }
}
exports.ExactScoreRule = ExactScoreRule;
