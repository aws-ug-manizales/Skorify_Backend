import {
  CreateMatchParam,
  CreateMatchUsecase,
  MatchContract,
  MatchEntity,
  //Domain events
  EntityNotInstanciableDomainEvent,
  InvalidMatchStatusOnCreateDomainEvent,
  MatchNotSavedDomainEvent,
  MatchSavedDomainEvent,
  MatchAlreadyExistsInSameTournamentStageDomainEvent,
} from "@skorify/domain/match";
import {
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
} from "@skorify/domain/tournament-instance";
import {
  GetTeamByIdUsecase,
  GottenTeamDomainEvent,
} from "@skorify/domain/team";
import { DomainEvent } from "@skorify/domain/core";

export class CreateMatchUsecaseImpl extends CreateMatchUsecase {
  constructor(
    private matchContract: MatchContract,
    private getTournamentInstanceByIdUsecase: GetTournamentInstanceByIdUsecase,
    private getTeamByIdUsecase: GetTeamByIdUsecase,
  ) {
    super();
  }

  async call(param: CreateMatchParam): Promise<DomainEvent> {
    const { awayTeamId, localTeamId, date, status, tournamentInstanceId } = param;

    // Verify if the tournament instance exists. 
    const tournamentInstanceDE = await this.getTournamentInstanceByIdUsecase.call({
      tournamentInstanceId,
    });

    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
        return tournamentInstanceDE;
      }
    
    const existingMatches = await this.matchContract.filter({
      tournamentInstanceId,
      awayTeamId,
      localTeamId,
    });
    
    const existingMatchesInverted = await this.matchContract.filter({
      tournamentInstanceId,
      awayTeamId: localTeamId,
      localTeamId: awayTeamId,
    }); 

    
    if (existingMatches.length > 0 || existingMatchesInverted.length > 0) {
      return MatchAlreadyExistsInSameTournamentStageDomainEvent();
    }

    //verify if the status is either "draft" or "scheduled". If it's not, return a domain event indicating that the match status is invalid for creation.
    if (status !== "draft" && status !== "scheduled") {
      return InvalidMatchStatusOnCreateDomainEvent();
    }
    // Create a new match entity using the provided parameters. 
    const match = MatchEntity.build({
      id: crypto.randomUUID(),
      tournamentInstanceId,
      awayTeamId,
      localTeamId,
      date,
      status,
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
