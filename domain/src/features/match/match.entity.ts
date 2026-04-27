import { Entity, Id } from "../../core/entity";
import { matchStateCollection, MatchState, MatchStatus } from "./match.state";

export class MatchEntity extends Entity {
  tournamentId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
  awayTeamScore: number;
  localTeamScore: number;
  private _status: MatchStatus;
  private _state: MatchState;
  private _timeToCloseInMinutes: number;  

  private constructor(id: Id, awayTeamId: Id, localTeamId: Id, date: Date, status: MatchStatus, tournamentId: Id) {
    super(id);
    this.tournamentId = tournamentId;
    this.awayTeamId = awayTeamId;
    this.localTeamId = localTeamId;
    this.date = date;
    this._timeToCloseInMinutes = 10;
    this.awayTeamScore = 0;
    this.localTeamScore = 0;
    this._status = status;
    this._state = matchStateCollection[status];
  }

  static build(params: { id: Id; awayTeamId: Id; localTeamId: Id; date: Date; status?: MatchStatus; tournamentId: Id }): MatchEntity {
    return new MatchEntity(
      params.id,
      params.awayTeamId,
      params.localTeamId,
      params.date,
      params.status ?? MatchStatus.Draft,
      params.tournamentId
    );
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
    this.localTeamScore = localTeamScore;
  }
}