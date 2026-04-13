import { Entity, Id } from "../../core/entity";

export class MatchEntity extends Entity {
  awayTeamId: string;
  localTeamId: string;
  date: Date;
  awayTeamScore: number;
  localTeamScore: number;
  
  private timeToCloseInMinutes: number;

  private constructor(id: Id, awayTeamId: string, localTeamId: string, date: Date) {
    super(id);
    this.awayTeamId = awayTeamId;
    this.localTeamId = localTeamId;
    this.date = date;
    this.timeToCloseInMinutes = 10;
    this.awayTeamScore = 0;
    this.localTeamScore = 0;
  }

  static build(params: { id: Id, awayTeamId: string; localTeamId: string; date: Date }): MatchEntity {
    return new MatchEntity(params.id, params.awayTeamId, params.localTeamId, params.date);
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
