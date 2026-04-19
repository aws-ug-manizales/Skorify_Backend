import {
  EditMatchParam,
  EditMatchUsecase,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchCannotBeEditedDomainEvent,
  MatchCannotChangeTeamsDomainEvent,
  MatchEditedDomainEvent,
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class EditMatchUsecaseImpl extends EditMatchUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  async call(param: EditMatchParam): Promise<DomainEvent> {
    const {
      matchId,
      awayTeamId,
      localTeamId,
      initialTime,
      status,
      awayTeamScore,
      localTeamScore,
    } = param;

    // 1. Validar que el partido existe
    const matchInDB = await this.matchContract.getById(matchId);

    if (!matchInDB) {
      return MatchDoesNotExistDomainEvent();
    }

    // 2. Validar que se puede editar (no está en curso)
    if (!matchInDB.canEdit()) {
      return MatchCannotBeEditedDomainEvent(matchInDB);
    }

    // 3. Validar cambios de equipos
    const teamsChanged =
      matchInDB.awayTeamId !== awayTeamId ||
      matchInDB.localTeamId !== localTeamId;

    if (teamsChanged) {
      // Obtener predicciones existentes
      const predictions =
        await this.matchContract.getPredictionsByMatchId(matchId);

      // Si hay predicciones y se intenta cambiar equipos, no permitir
      if (predictions && predictions.length > 0) {
        return MatchCannotChangeTeamsDomainEvent(matchInDB);
      }
    }

    // 4. Aplicar cambios
    matchInDB.awayTeamId = awayTeamId;
    matchInDB.localTeamId = localTeamId;
    matchInDB.date = initialTime;
    matchInDB.status = status;
    matchInDB.setScores(awayTeamScore, localTeamScore);

    // 5. Persistir cambios
    await this.matchContract.save(matchInDB);

    // 6. Retornar evento de éxito
    return MatchEditedDomainEvent(matchInDB);
  }
}
