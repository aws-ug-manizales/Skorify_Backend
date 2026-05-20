import { BuiltEntityDomainEvent, DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
import { MatchState, matchStateCollection, MatchStatus } from './match.state';

export type MatchStage = 'group' | 'finals';

export interface MatchAttributes {
  id: Id;
  homeTeamId: Id;
  awayTeamId: Id;
  tournamentId: Id;
  kickOff: Date;
  homeScore?: number;
  awayScore?: number;
  status?: MatchStatus;
  stage?: MatchStage;
  venue?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class MatchEntity extends Entity {
  tournamentId: Id;
  awayTeamId: Id;
  homeTeamId: Id;
  kickOff: Date;
  awayScore?: number;
  homeScore?: number;
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
    this.awayScore = attributes.awayScore ?? 0;
    this.homeScore = attributes.homeScore ?? 0;
    this.stage = attributes.stage;
    this.venue = attributes.venue;
    this._status = attributes.status!;
    this._state = matchStateCollection[attributes.status!];
  }

  static build(params: MatchAttributes): DomainEvent {
    return BuiltEntityDomainEvent(
      new MatchEntity({
        ...params,
        status: params.status ?? MatchStatus.Draft,
      }),
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

  public setScores(awayScore: number, homeScore: number): void {
    this.awayScore = awayScore;
    this.homeScore = homeScore;
  }
}
