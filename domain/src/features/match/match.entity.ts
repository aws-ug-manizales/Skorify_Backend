import { Entity, Id } from "../../core/entity";

export interface  MatchAttributes {
  id: Id;
  tournamentId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
  status: "draft" | "scheduled" | "finished";
}

export class MatchEntity extends Entity {
  tournamentId: Id;
  awayTeamId: Id;
  localTeamId: Id;
  date: Date;
  status: "draft" | "scheduled" | "finished";
  awayTeamScore: number;
  localTeamScore: number;
  
  private timeToCloseInMinutes: number;

  private constructor(attributes: MatchAttributes) {
    const { id, tournamentId, awayTeamId, localTeamId, date, status } = attributes;
    super(id);
    this.tournamentId = tournamentId;
    this.awayTeamId = awayTeamId;
    this.localTeamId = localTeamId;
    this.date = date;
    this.status = status;
    this.timeToCloseInMinutes = 10;
    this.awayTeamScore = 0;
    this.localTeamScore = 0;
  }

  static build(params: MatchAttributes): MatchEntity | null {
    return new MatchEntity(params);
  }

  public canBet(): boolean {
    // TODO: Implement business logic to determine if betting is allowed
    // 1. Validar si es posible hacer una apuesta (en tiempo, por estado)
    // 2. Verificar si la competencia esta vigente ? Por definir
    // 3. Verificar integridad de la apuesta
    return true;
  }


  public isMatchClose(): boolean {
    return this.date.getTime() - Date.now() < this.timeToCloseInMinutes * 60 * 1000;
  }
  
  public setScores(awayTeamScore: number, localTeamScore: number): void {
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
  }
}
