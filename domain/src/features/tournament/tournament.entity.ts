import { Entity, Id } from "../../core";

export enum MatchType {
  SingleMatchPerRound = "single_match_per_round",
  HomeAndAwayPerRound = "home_and_away_per_round",
}

export interface TournamentAttributes {
  id: Id;
  name: string;
  startDate: Date;
  endDate: Date;
  matchType: MatchType;
  token: string;
}

export class TournamentEntity extends Entity {
  name: string;
  startDate: Date;
  endDate: Date;
  matchType: MatchType;
  token: string;

  private constructor(attributes: TournamentAttributes) {
    const { id, name, startDate, endDate, matchType, token } = attributes;
    super(id, new Date());
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.matchType = matchType ?? MatchType.SingleMatchPerRound;
    this.token = token;
  }

  static build(params: TournamentAttributes): TournamentEntity | null {
    return new TournamentEntity(params);
  }
}
