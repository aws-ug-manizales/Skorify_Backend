import { Entity, Id } from "../../core/entity";
import { matchStateCollection, MatchState, MatchStatus } from "./match.state";

export type MatchStage = "group" | "finals";

export interface MatchAttributes {
  id: Id;
  homeTeamId: Id;
  awayTeamId: Id;
  tournamentId: Id;
  kickOff: Date;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status?: MatchStatus;
  stage?: MatchStage;
  venue?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class MatchEntity extends Entity {
  awayTeamId: Id;
  homeTeamId: Id;
  kickOff: Date;
  tournamentId: Id;
  awayTeamScore?: number;
  homeTeamScore?: number;
  stage?: MatchStage;
  venue?: string | null;
  private _status: MatchStatus;
  private _state: MatchState;
  private _timeToCloseInMinutes: number;

  private constructor(attributes: MatchAttributes) {
    super(attributes.id, new Date());
    this.awayTeamId = attributes.awayTeamId;
    this.homeTeamId = attributes.homeTeamId;
    this.kickOff = attributes.kickOff;
    this.tournamentId = attributes.tournamentId;
    this._timeToCloseInMinutes = 10;
    this.awayTeamScore = 0;
    this.homeTeamScore = 0;
    this.stage = attributes.stage;
    this.venue = attributes.venue;
    this._status = attributes.status!;
    this._state = matchStateCollection[attributes.status!];
  }

  static build(params: MatchAttributes): MatchEntity {
    return new MatchEntity({
      ...params,
      status: params.status ?? MatchStatus.Draft,
    });
  }

  get status(): MatchStatus {
    return this._status;
  }

  set status(value: MatchStatus) {
    this._status = value;
    this._state = matchStateCollection[value];
  }

  get timeToCloseInMinutes(): number {
    return this._timeToCloseInMinutes;
  }

  public canBet(): boolean {
    return this._state.canBet(this);
  }

  public canEdit(): boolean {
    return this._state.canEdit(this);
  }

  public canChangeTeams(hasPredictions: boolean): boolean {
    return this._state.canChangeTeams(this, hasPredictions);
  }

  public isMatchClose(): boolean {
    return this._state.isMatchClose(this);
  }

  public setScores(awayTeamScore: number, localTeamScore: number): void {
    this.awayTeamScore = awayTeamScore;
    this.homeTeamScore = localTeamScore;
  }
}
