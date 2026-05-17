import {
  CreateTournamentParam,
  CreateTournamentUsecase,
  EntityNotInstanciableDomainEvent,
  TournamentContract,
  TournamentEntity,
  TournamentNotSavedDomainEvent,
  TournamentSavedDomainEvent,
} from "@skorify/domain/tournament";
import { DomainEvent } from "@skorify/domain/core";
import crypto from "crypto";
import { LogUsecase } from '@skorify/shared';

export class CreateTournamentUsecaseImpl extends CreateTournamentUsecase {
  constructor(private tournamentContract: TournamentContract) {
    super();
  }

  @LogUsecase()
  async call(param: CreateTournamentParam): Promise<DomainEvent> {
    const { endDate, name, startDate, matchType } = param;

    const tournament = TournamentEntity.build({
      endDate,
      id: crypto.randomUUID(),
      name,
      startDate,
      matchType,  
      token: crypto.randomUUID(),
    });

    if (!tournament) {
      return EntityNotInstanciableDomainEvent();
    }

    const saved = await this.tournamentContract.save(tournament);

    if (!saved) {
      return TournamentNotSavedDomainEvent();
    }

    return TournamentSavedDomainEvent(saved);
  }
}
