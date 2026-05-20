"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchStateCollection = exports.CancelledState = exports.FinishedState = exports.InProgressState = exports.ScheduledState = exports.DraftState = exports.MatchStatus = void 0;
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["Draft"] = "draft";
    MatchStatus["Scheduled"] = "scheduled";
    MatchStatus["InProgress"] = "in_progress";
    MatchStatus["Finished"] = "finished";
    MatchStatus["Cancelled"] = "cancelled";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
class DraftState {
    canEdit(match) {
        return true;
    }
    canBet(match) {
        return true;
    }
    canChangeTeams(match, hasPredictions) {
        return !hasPredictions;
    }
    isMatchClose(match) {
        return match.kickOff.getTime() - Date.now() < match.timeToCloseInMinutes * 60 * 1000;
    }
}
exports.DraftState = DraftState;
class ScheduledState {
    canEdit(match) {
        return true;
    }
    canBet(match) {
        return !this.isMatchClose(match);
    }
    canChangeTeams(match, hasPredictions) {
        return !hasPredictions;
    }
    isMatchClose(match) {
        return match.kickOff.getTime() - Date.now() < match.timeToCloseInMinutes * 60 * 1000;
    }
}
exports.ScheduledState = ScheduledState;
class InProgressState {
    canEdit(match) {
        return false;
    }
    canBet(match) {
        return false;
    }
    canChangeTeams(match, hasPredictions) {
        return false;
    }
    isMatchClose(match) {
        return true;
    }
}
exports.InProgressState = InProgressState;
class FinishedState {
    canEdit(match) {
        return false;
    }
    canBet(match) {
        return false;
    }
    canChangeTeams(match, hasPredictions) {
        return false;
    }
    isMatchClose(match) {
        return true;
    }
}
exports.FinishedState = FinishedState;
class CancelledState {
    canEdit(match) {
        return false;
    }
    canBet(match) {
        return false;
    }
    canChangeTeams(match, hasPredictions) {
        return false;
    }
    isMatchClose(match) {
        return true;
    }
}
exports.CancelledState = CancelledState;
exports.matchStateCollection = {
    [MatchStatus.Draft]: new DraftState(),
    [MatchStatus.Scheduled]: new ScheduledState(),
    [MatchStatus.InProgress]: new InProgressState(),
    [MatchStatus.Finished]: new FinishedState(),
    [MatchStatus.Cancelled]: new CancelledState(),
};
