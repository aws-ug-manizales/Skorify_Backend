import { EventBusContract, DomainEvent } from "@skorify/domain/core";
import {
  CalculateMatchScoreUsecase,
  GottenMatchDomainEvent,
  ReactiveClosedMatchDomainEvent,
} from "@skorify/domain/match";

export function configureRules(
  eventBusContract: EventBusContract,
  calculateMatchScoreUsecase: CalculateMatchScoreUsecase,
) {
  // Suscribirse al evento ReactiveClosedMatchDomainEvent
  // Cuando se emite este evento, se ejecuta el caso de uso CalculateMatchScoreUsecase
  eventBusContract.on(
    ReactiveClosedMatchDomainEvent,
    async (event: DomainEvent) => {
      const { match } = event.payload;
      await calculateMatchScoreUsecase.call({
        matchId: match.id,
      });
    },
  );

  // Configurar el handler que se ejecuta cuando todos los eventos del grupo se completan
  eventBusContract.afterGroupCompletion({
    domainEvent: ReactiveClosedMatchDomainEvent,
    completionHandler: (event: DomainEvent) => {
      // Verificar si el evento es del tipo esperado (GottenMatchDomainEvent)
      // Esto indica que el cálculo del puntaje se completó exitosamente
      return event.is(GottenMatchDomainEvent);
    },
    handler: async (events: DomainEvent[]) => {
      // Cuando todos los eventos del grupo se completan exitosamente,
      // aquí se debería calcular la tabla de posiciones global
      // await calculateGlobalTableUsecase.call({
      //     tournamentId: "UUID"
      // })
      console.log(
        `Grupo completado con ${events.length} eventos. Calculando tabla global...`,
      );
    },
  });
}
