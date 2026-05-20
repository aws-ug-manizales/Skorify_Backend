"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalDiff = goalDiff;
exports.outcome = outcome;
exports.isSameOutcome = isSameOutcome;
exports.isExactScore = isExactScore;
exports.isInverseOutcome = isInverseOutcome;
exports.totalGoals = totalGoals;
function goalDiff(score) {
    return score.awayScore - score.homeScore;
}
function outcome(score) {
    const diff = goalDiff(score);
    if (diff === 0)
        return 0;
    return diff > 0 ? 1 : -1;
}
function isSameOutcome(a, b) {
    return outcome(a) === outcome(b);
}
function isExactScore(a, b) {
    return a.awayScore === b.awayScore && a.homeScore === b.homeScore;
}
function isInverseOutcome(a, b) {
    const oa = outcome(a);
    const ob = outcome(b);
    if (oa === 0 || ob === 0)
        return false;
    return oa === -ob;
}
function totalGoals(score) {
    return score.awayScore + score.homeScore;
}
