import type { CreateMatchParam } from "@skorify/domain/match";
import {
  CreateMatchUsecase,
  MatchContract,
  MatchEntity,
  EntityNotInstanciableDomainEvent,
  MatchNotSavedDomainEvent,
  MatchSavedDomainEvent,
  MatchAlreadyExistsInSameTournamentStageDomainEvent,
  MatchTeamDoesNotExistDomainEvent,
  MatchTeamIsTheSameDomainEvent,
} from "@skorify/domain/match";
import {
  GetTournamentByIdUsecase,
  GottenTournamentDomainEvent,
} from "@skorify/domain/tournament";
import { MatchType } from "@skorify/domain/tournament";
import {
  GetTeamByIdUsecase,
  GottenTeamDomainEvent,
} from "@skorify/domain/team";
import type { DomainEvent } from "@skorify/domain/core";

export class CreateMatchUsecaseImpl extends CreateMatchUsecase {
  constructor(
    private matchContract: MatchContract,
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,
    private getTeamByIdUsecase: GetTeamByIdUsecase,
  ) {
    super();
  }

  async call(param: CreateMatchParam): Promise<DomainEvent> {
    const { awayTeamId, homeTeamId, kickOff, tournamentId, stage } = param;

    if (awayTeamId === homeTeamId) {
      return MatchTeamIsTheSameDomainEvent();
    }

    // Verify if the tournament instance exists. 
    const tournamentDE = await this.getTournamentByIdUsecase.call({
      tournamentId,
    });

    if (tournamentDE.isNot(GottenTournamentDomainEvent)) {
      return tournamentDE;
    }

    const [homeTeamDE, awayTeamDE] = await Promise.all([
      this.getTeamByIdUsecase.call({ teamId: homeTeamId }),
      this.getTeamByIdUsecase.call({ teamId: awayTeamId }),
    ]);

    if (
      homeTeamDE.isNot(GottenTeamDomainEvent) ||
      awayTeamDE.isNot(GottenTeamDomainEvent)
    ) {
      return MatchTeamDoesNotExistDomainEvent();
    }
    
    const existingMatches = await this.matchContract.filter({
      tournamentId,
      homeTeamId,
      awayTeamId,
      stage,
    });
    
    if (existingMatches.length > 0) {
      return MatchAlreadyExistsInSameTournamentStageDomainEvent();
    }

    // If the tournament only allows one match per round, verify there is no
    // reversed fixture (same teams inverted) in the same stage.
    if (tournamentDE.payload.matchType === MatchType.SingleMatchPerRound) {
      const reversedMatches = await this.matchContract.filter({
        tournamentId,
        homeTeamId: awayTeamId,
        awayTeamId: homeTeamId,
        stage,
      });

      if (reversedMatches.length > 0) {
        return MatchAlreadyExistsInSameTournamentStageDomainEvent();
      }
    }

    // Create a new match entity using the provided parameters. 
    const match = MatchEntity.build({
      id: crypto.randomUUID(),
      tournamentId,
      awayTeamId,
      homeTeamId,
      kickOff,
      stage,
      createdAt: new Date(),
    });
    
    //The entity can't be instatiated for any reason.
    if (!match) {
      return EntityNotInstanciableDomainEvent();
    }

    const saved = await this.matchContract.save(match);

     //The entity can't be saved for any reason.
    if (!saved) {
      return MatchNotSavedDomainEvent();
    }

    //The entity is successfully saved.
    return MatchSavedDomainEvent(saved);
  }
}
