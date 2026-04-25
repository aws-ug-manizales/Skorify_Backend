import {
  CreateTournamentInstanceParam,
  CreateTournamentInstanceUsecase,
  EntityNotInstanciableDomainEvent,
  TournamentInstanceContract,
  TournamentInstanceEntity,
  TournamentInstanceWithSameNameDomainEvent,
} from "@skorify/domain/tournament-instance";
import { DomainEvent } from "@skorify/domain/core";
import {
  GetTournamentByIdUsecase,
  GottenTournamentDomainEvent,
} from "@skorify/domain/tournament";

export class CreateTournamentInstanceUsecaseImpl extends CreateTournamentInstanceUsecase {
  constructor(
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,

    private tournamentInstanceContract: TournamentInstanceContract,
  ) {
    super();
  }

  async call(param: CreateTournamentInstanceParam): Promise<DomainEvent> {
    const { name, owner, tournamentId } = param;

    const tournamentDE = await this.getTournamentByIdUsecase.call({
      tournamentId,
    });

    if (tournamentDE.isNot(GottenTournamentDomainEvent)) {
      return tournamentDE;
    }

    const exist = await this.tournamentInstanceContract.filter({ name });

    if (exist.length) {
      return TournamentInstanceWithSameNameDomainEvent(exist);
    }

    const tournamentInstance = TournamentInstanceEntity.build({
      id: crypto.randomUUID(),
      name,
      state: "active",
    });

    if (!tournamentInstance) {
      return EntityNotInstanciableDomainEvent();
    }

    const saved =
      await this.tournamentInstanceContract.save(tournamentInstance);

    if (!saved) {
      //malo
    }

    //bien
    return EntityNotInstanciableDomainEvent();
  }
}
