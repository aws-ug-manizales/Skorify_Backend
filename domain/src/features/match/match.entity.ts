import { Entity, Id } from "../../core/entity";

export class MatchEntity extends Entity {
  awayTeamId: string;
  localTeamId: string;
  date: Date;
  awayTeamScore: number;
  localTeamScore: number;

  private closePredictionInSeconds: number;

  private constructor(id: Id, awayTeamId: string, localTeamId: string, date: Date) {
    super(id);
    this.awayTeamId = awayTeamId;
    this.localTeamId = localTeamId;
    this.date = date;
    this.closePredictionInSeconds = MatchEntity.resolveClosePredictionInSeconds();
    this.awayTeamScore = 0;
    this.localTeamScore = 0;
  }

  private static resolveClosePredictionInSeconds(): number {
    const defaultCloseSeconds = 600;
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const parsedValue = Number.parseInt(env?.CLOSEPREDICTION ?? "", 10);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      return defaultCloseSeconds;
    }

    return parsedValue;
  }

  static build(params: { id: Id, awayTeamId: string; localTeamId: string; date: Date }): MatchEntity {
    return new MatchEntity(params.id, params.awayTeamId, params.localTeamId, params.date);
  }

  public canBet(): boolean {
    const timeUntilMatchStartsInMs = this.date.getTime() - Date.now();

    if (timeUntilMatchStartsInMs <= 0) {
      return false;
    }

    return timeUntilMatchStartsInMs > this.closePredictionInSeconds * 1000;
  }


  public isMatchClose(): boolean {
    return this.date.getTime() - Date.now() <= this.closePredictionInSeconds * 1000;
  }
  
  public setScores(awayTeamScore: number, localTeamScore: number): void {
    this.awayTeamScore = awayTeamScore;
    this.localTeamScore = localTeamScore;
  }
}
