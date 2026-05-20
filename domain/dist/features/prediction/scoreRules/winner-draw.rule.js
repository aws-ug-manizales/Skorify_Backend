"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinnerDrawRule = void 0;
const score_rule_utils_1 = require("./score-rule.utils");
class WinnerDrawRule {
    ruleScore = 2;
    getRuleScore() {
        return this.ruleScore;
    }
    getRuleName() {
        return WinnerDrawRule.name;
    }
    calculateScore(context) {
        if ((0, score_rule_utils_1.isSameOutcome)(context.prediction, context.match)) {
            return this.ruleScore;
        }
        return 0;
    }
}
exports.WinnerDrawRule = WinnerDrawRule;
