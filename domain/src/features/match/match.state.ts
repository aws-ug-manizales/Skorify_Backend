import type { MatchEntity } from "./match.entity";

export enum MatchStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  InProgress = "in_progress",
  Finished = "finished",
  Cancelled = "cancelled",
}

export interface MatchState {
  canEdit(match: MatchEntity): boolean;
  canBet(match: MatchEntity): boolean;
  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean;
  isMatchClose(match: MatchEntity): boolean;
}

export class DraftState implements MatchState {
  canEdit(match: MatchEntity): boolean {
    return true;
  }

  canBet(match: MatchEntity): boolean {
    return true;
  }

  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean {
    return !hasPredictions;
  }

  isMatchClose(match: MatchEntity): boolean {
    return match.date.getTime() - Date.now() < match.timeToCloseInMinutes * 60 * 1000;
  }
}

export class ScheduledState implements MatchState {
  canEdit(match: MatchEntity): boolean {
    return true;
  }

  canBet(match: MatchEntity): boolean {
    return !this.isMatchClose(match);
  }

  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean {
    return !hasPredictions;
  }

  isMatchClose(match: MatchEntity): boolean {
    return match.date.getTime() - Date.now() < match.timeToCloseInMinutes * 60 * 1000;
  }
}

export class InProgressState implements MatchState {
  canEdit(match: MatchEntity): boolean {
    return false;
  }

  canBet(match: MatchEntity): boolean {
    return false;
  }

  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean {
    return false;
  }

  isMatchClose(match: MatchEntity): boolean {
    return true;
  }
}

export class FinishedState implements MatchState {
  canEdit(match: MatchEntity): boolean {
    return false;
  }

  canBet(match: MatchEntity): boolean {
    return false;
  }

  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean {
    return false;
  }

  isMatchClose(match: MatchEntity): boolean {
    return true;
  }
}

export class CancelledState implements MatchState {
  canEdit(match: MatchEntity): boolean {
    return false;
  }

  canBet(match: MatchEntity): boolean {
    return false;
  }

  canChangeTeams(match: MatchEntity, hasPredictions: boolean): boolean {
    return false;
  }

  isMatchClose(match: MatchEntity): boolean {
    return true;
  }
}

export const matchStateCollection: Record<MatchStatus, MatchState> = {
  [MatchStatus.Draft]: new DraftState(),
  [MatchStatus.Scheduled]: new ScheduledState(),
  [MatchStatus.InProgress]: new InProgressState(),
  [MatchStatus.Finished]: new FinishedState(),
  [MatchStatus.Cancelled]: new CancelledState(),
};
