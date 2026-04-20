import {
  EditMatchParam,
  EditMatchUsecase,
  MatchContract,
  MatchDoesNotExistDomainEvent,
  MatchCannotBeEditedDomainEvent,
  MatchCannotChangeTeamsDomainEvent,
  MatchCannotBeSavedDomainEvent,
  MatchEditedDomainEvent,
  MatchStatus,
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
      date,
      status,
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

    // 2.5. Validar que no se intenta cerrar el partido (cambiar a Finished)
    if (status === MatchStatus.Finished) {
      return MatchCannotBeEditedDomainEvent(matchInDB); // O crear un evento específico, pero por ahora reutilizar
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
    matchInDB.date = date;
    matchInDB.status = status;

    // 5. Persistir cambios
    const savedMatch = await this.matchContract.save(matchInDB);
    if (!savedMatch) {
      return MatchCannotBeSavedDomainEvent(matchInDB);
    }

    // 6. Retornar evento de éxito
    return MatchEditedDomainEvent(matchInDB);
  }
}
