import {
  CreateMatchParam,
  CreateMatchUsecase,
  MatchDoesNotExistDomainEvent,
  GottenMatchDomainEvent,
  MatchContract,
  MatchEntity,
  MatchCannotBeSavedDomainEvent,
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

export class CreateMatchUsecaseImpl extends CreateMatchUsecase {
  constructor(private matchContract: MatchContract) {
    super();
  }

  async call(param: CreateMatchParam): Promise<DomainEvent> {
    const { homeTeamId, awayTeamId, tournamentId, kickOff, stage, venue } = param;

    // 1. Validar que los equipos sean diferentes
    if (homeTeamId === awayTeamId) {
      return MatchCannotBeSavedDomainEvent(null as any);  // TODO: mejorar el mensaje
    }

    //algunas validaciones posteriores podrían ser: 
    //  -validar que los equipos existan
    //  -validar que el torneo exista
    //  -validar que no haya otro partido igual (definir que significa un partido igual--- mismos equipos, mismo torneo, misma fecha y hora por ejemplo).

    // 2. Crear la entidad
    const newMatch = MatchEntity.build({
      id: crypto.randomUUID() as any,
      homeTeamId: homeTeamId as any,
      awayTeamId: awayTeamId as any,
      tournamentId: tournamentId as any,
      kickOff,
      stage: stage ?? "group",
      venue:venue,
      createdAt: new Date(),
    });

    // 3. Guardar
    const savedMatch = await this.matchContract.save(newMatch);

    if (!savedMatch) {
      return MatchCannotBeSavedDomainEvent(newMatch);
    }

    return GottenMatchDomainEvent(savedMatch);
  }
}
