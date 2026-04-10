import { Entity, Id } from "../../core/entity";

export class BetEntity extends Entity {
  userId: Id;
  matchId: Id;
  awayTeamScore: number;
  localTeamScore: number;

  private constructor(id: Id, userId: Id, matchId: Id, awayTeamScore: number, localTeamScore: number) {
    super(id);
    this.userId = userId;
    this.matchId = matchId;
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
  }

  build(params: { userId: Id; matchId: Id; awayTeamScore: number; localTeamScore: number }): BetEntity {
    return new BetEntity(this.id, params.userId, params.matchId, params.awayTeamScore, params.localTeamScore);
  }
}
