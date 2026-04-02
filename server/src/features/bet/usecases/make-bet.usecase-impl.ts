import {
  BasicDomainEvent,
  MakeBetParam,
  MakeBetUsecase,
} from "@skorify/domain/bet";
import { DomainEvent } from "@skorify/domain/core";
import {
  GetUserByIdUsecase,
  GottenUserDomainEvent,
} from "@skorify/domain/user";
import { GetMatchByIdUsecase } from "@skorify/domain/match";

export class MakeBetUsecaseImpl extends MakeBetUsecase {
  constructor(
    private getUserByIdUsecase: GetUserByIdUsecase,
    private getMatchByIdUsecase: GetMatchByIdUsecase,
  ) {
    super();
  }

  async call(param: MakeBetParam): Promise<DomainEvent> {
    console.log(param);
    const { awayTeamScore, localTeamScore, matchId, userId } = param;

    // 1. Validación de que dalia exista
    const userDE = await this.getUserByIdUsecase.call({
      userId,
    });

    if (userDE.isNot(GottenUserDomainEvent)) {
      return userDE;
    }
    // 2. Valida el partido
    const matchDE = await this.getMatchByIdUsecase.call({
      matchId,
    });

    if (matchDE.isNot(GottenUserDomainEvent)) {
      return matchDE;
    }

    const match = matchDE.payload;

    // 3. Validar si es posible hacer una apuesta (en tiempo, por estado)
    // 4. Verificar si la competencia esta vigente ? Por definir
    // 5. Verificar integridad de la apuesta
    // 6. Ingreso a la persistencia apuesta de Dalia

    return BasicDomainEvent();
  }
}
