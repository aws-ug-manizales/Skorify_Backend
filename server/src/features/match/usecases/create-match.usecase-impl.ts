import type { CreateMatchParam } from "@skorify/domain/match";
import {
  CreateMatchUsecase,
  MatchContract,
  MatchEntity,
  EntityNotInstanciableDomainEvent,
  MatchNotSavedDomainEvent,
  MatchSavedDomainEvent,
  MatchAlreadyExistsInSameTournamentStageDomainEvent,
} from "@skorify/domain/match";
import {
  GetTournamentByIdUsecase,
  GottenTournamentDomainEvent,
} from "@skorify/domain/tournament";
import type { DomainEvent } from "@skorify/domain/core";

export class CreateMatchUsecaseImpl extends CreateMatchUsecase {
  constructor(
    private matchContract: MatchContract,
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,
  ) { 
    super();
  }

  async call(param: CreateMatchParam): Promise<DomainEvent> {
    const { awayTeamId, homeTeamId, kickOff, tournamentId, createdAt  } = param;

    // Verify if the tournament instance exists. 
    const tournamentInstanceDE = await this.getTournamentByIdUsecase.call({x
      tournamentId,
    });

    if (tournamentInstanceDE.isNot(GottenTournamentDomainEvent)) {
        return tournamentInstanceDE;
      }
    
    const existingMatches = await this.matchContract.filter({
      tournamentId,
      awayTeamId,
      homeTeamId,
    });
    
    const existingMatchesInverted = await this.matchContract.filter({
      tournamentId,
      awayTeamId: homeTeamId,
      homeTeamId: awayTeamId,
    }); 

    
    if (existingMatches.length > 0 || existingMatchesInverted.length > 0) {
      return MatchAlreadyExistsInSameTournamentStageDomainEvent();
    }

    // Create a new match entity using the provided parameters. 
    const match = MatchEntity.build({
      id: crypto.randomUUID(),
      tournamentId,
      awayTeamId,
      homeTeamId,
      kickOff,
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
