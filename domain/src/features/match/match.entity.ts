import { Entity, Id } from "../../core/entity";

export type MatchStatus = "scheduled" | "in_progress" | "finished";
export type MatchStage = "group" | "finals";

export interface MatchBuildParams {
  id: Id;
  homeTeamId: string;
  awayTeamId: string;
  tournamentId: string;
  kickOff: Date;
  homeGoals?: number | null;
  awayGoals?: number | null;
  status?: MatchStatus;
  stage?: MatchStage;
  venue?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class MatchEntity extends Entity {
  homeTeamId: string;
  awayTeamId: string;
  tournamentId: string;
  kickOff: Date;
  homeGoals: number | null;
  awayGoals: number | null;
  status: MatchStatus;
  stage: MatchStage;
  venue: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  private timeToCloseInMinutes: number;

  private constructor(params: MatchBuildParams) {
    super(params.id);
    this.homeTeamId = params.homeTeamId;
    this.awayTeamId = params.awayTeamId;
    this.tournamentId = params.tournamentId;
    this.kickOff = params.kickOff;
    this.homeGoals = params.homeGoals ?? null;
    this.awayGoals = params.awayGoals ?? null;
    this.status = params.status ?? "scheduled";
    this.stage = params.stage ?? "group";
    this.venue = params.venue ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? null;
    this.timeToCloseInMinutes = 10;
  }

  static build(params: MatchBuildParams): MatchEntity {
    return new MatchEntity(params);
  }

  public canBet(): boolean {
    if (this.status !== "scheduled") {
      return false;
    }
    return !this.isMatchClose();
  }

  public isMatchClose(): boolean {
    return this.kickOff.getTime() - Date.now() < this.timeToCloseInMinutes * 60 * 1000;
  }

  public setScores(homeGoals: number, awayGoals: number): void {
    this.homeGoals = homeGoals;
    this.awayGoals = awayGoals;
  }

  public start(): void {
    this.status = "in_progress";
    this.updatedAt = new Date();
  }

  public finish(homeGoals: number, awayGoals: number): void {
    this.setScores(homeGoals, awayGoals);
    this.status = "finished";
    this.updatedAt = new Date();
  }
}
