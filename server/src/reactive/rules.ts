import { EventBusContract } from "@skorify/domain/core";
import {
  GottenMatchDomainEvent,
  ReactiveClosedMatchDomainEvent,
} from "@skorify/domain/match";

export function configureRules(eventBusContract: EventBusContract) {
  eventBusContract.afterGroupCompletion({
    domainEvent: ReactiveClosedMatchDomainEvent,
    completionHandler: (event) => {
      return event.is(GottenMatchDomainEvent);
    },
    handler: (events) => {
        await calculateGlobalTableUsecase.call({
            tournamentId: "UUID"
        })
    },
  });
}
