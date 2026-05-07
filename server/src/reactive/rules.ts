import { EventBusContract } from "@skorify/domain/core";
import {
  CalculateMatchScoreUsecase,
  GottenMatchDomainEvent,
  ReactiveClosedMatchDomainEvent,
} from "@skorify/domain/match";

export function configureRules(eventBusContract: EventBusContract) {



  eventBusContract.on(ReactiveClosedMatchDomainEvent,CalculateMatchScoreUsecase);
  
  eventBusContract.on(ReactiveClosedMatchDomainEvent,CalculateMatchScoreUsecase);

  eventBusContract.afterGroupCompletion({
    domainEvent: ReactiveClosedMatchDomainEvent,
    completionHandler: (event) => {
      return event.is(GottenMatchDomainEvent);
    },
    handler: (events) => {
      // await calculateGlobalTableUsecase.call({
      //     tournamentId: "UUID"
      // })
    },
  });
}
