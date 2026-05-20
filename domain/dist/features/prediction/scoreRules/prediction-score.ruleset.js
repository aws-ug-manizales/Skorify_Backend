"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionScoreRuleset = void 0;
const exact_score_rule_1 = require("./exact-score.rule");
const high_scoring_match_rule_1 = require("./high-scoring-match.rule");
const inverse_result_rule_1 = require("./inverse-result.rule");
const team_goals_rule_1 = require("./team-goals.rule");
const winner_draw_rule_1 = require("./winner-draw.rule");
class PredictionScoreRuleset {
    rules;
    constructor(rules) {
        this.rules = rules;
    }
    static default() {
        return new PredictionScoreRuleset([
            new winner_draw_rule_1.WinnerDrawRule(),
            new team_goals_rule_1.TeamGoalsRule(),
            new exact_score_rule_1.ExactScoreRule(),
            new high_scoring_match_rule_1.HighScoringMatchRule(),
            new inverse_result_rule_1.InverseResultRule(),
        ]);
    }
    calculateWithBreakdown(context) {
        const breakdown = this.rules
            .map((rule) => {
            const points = rule.calculateScore(context);
            return {
                rule: rule.getRuleName(),
                points,
            };
        })
            .filter((item) => item.points > 0);
        const total = breakdown.reduce((sum, item) => sum + item.points, 0);
        return {
            total,
            breakdown,
        };
    }
    getRules() {
        return this.rules.map(r => {
            return {
                name: r.getRuleName(),
                score: r.getRuleScore()
            };
        });
    }
}
exports.PredictionScoreRuleset = PredictionScoreRuleset;
