"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InverseResultRule = void 0;
const score_rule_utils_1 = require("./score-rule.utils");
class InverseResultRule {
    ruleScore = 1;
    getRuleScore() {
        return this.ruleScore;
    }
    getRuleName() {
        return InverseResultRule.name;
    }
    calculateScore(context) {
        if ((0, score_rule_utils_1.isInverseOutcome)(context.prediction, context.match)) {
            return this.ruleScore;
        }
        return 0;
    }
}
exports.InverseResultRule = InverseResultRule;
