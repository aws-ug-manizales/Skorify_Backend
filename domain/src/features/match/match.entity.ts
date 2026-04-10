import { Entity, Id } from "../../core/entity";

export class MatchEntity extends Entity {
  awayTeamId: string;
  localTeamId: string;
  date: Date;

  private constructor(id: Id, awayTeamId: string, localTeamId: string, date: Date) {
    super(id);
    this.awayTeamId = awayTeamId;
    this.localTeamId = localTeamId;
    this.date = date;
  }

  build(params: { awayTeamId: string; localTeamId: string; date: Date }): MatchEntity {
    return new MatchEntity(this.id, params.awayTeamId, params.localTeamId, params.date);
  }

  public canBet(): boolean {
    // TODO: Implement business logic to determine if betting is allowed
    // 1. Validar si es posible hacer una apuesta (en tiempo, por estado)
    // 2. Verificar si la competencia esta vigente ? Por definir
    // 3. Verificar integridad de la apuesta
    return true;
  }
}
