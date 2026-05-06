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
import {
  GottenPredictionsDomainEvent,
  PredictionContract,
} from "@skorify/domain/prediction";
import { DomainEvent } from "@skorify/domain/core";
import { GetPredictionsByMatchUsecase } from "@skorify/domain/prediction";

export class EditMatchUsecaseImpl extends EditMatchUsecase {
  constructor(
    private matchContract: MatchContract,
    private getPredictionsByMatchUsecase: GetPredictionsByMatchUsecase,
  ) {
    super();
  }

  async call(param: EditMatchParam): Promise<DomainEvent> {
    const { matchId, awayTeamId, homeTeamId, date, status } = param;

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
      return MatchCannotBeEditedDomainEvent(matchInDB);
    }

    // 3. Validar cambios de equipos
    const teamsChanged =
      matchInDB.awayTeamId !== awayTeamId ||
      matchInDB.homeTeamId !== homeTeamId;

    if (teamsChanged) {
      // Obtener predicciones usando filter genérico (equipo de datos)
      const predictionsDE = await this.getPredictionsByMatchUsecase.call({
        matchId,
      });
      if (predictionsDE.isNot(GottenPredictionsDomainEvent)) {
        return predictionsDE;
      }

      const predictions = predictionsDE.payload;
      const hasPredictions = predictions.length > 0;

      // Si hay predicciones y se intenta cambiar equipos, no permitir
      if (hasPredictions) {
        return MatchCannotChangeTeamsDomainEvent(matchInDB);
      }
    }

    // 4. Aplicar cambios
    matchInDB.awayTeamId = awayTeamId;
    matchInDB.homeTeamId = homeTeamId;
    matchInDB.kickOff = date;
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
