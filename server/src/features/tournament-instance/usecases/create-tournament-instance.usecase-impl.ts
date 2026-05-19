import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import { GetTournamentByIdUsecase, GottenTournamentDomainEvent } from '@skorify/domain/tournament';
import {
  CreateTournamentInstanceParam,
  CreateTournamentInstanceUsecase,
  TournamentInstanceContract,
  TournamentInstanceEntity,
  TournamentInstanceNotSavedDomainEvent,
  TournamentInstanceSavedDomainEvent,
  TournamentInstanceWithSameNameDomainEvent,
} from '@skorify/domain/tournament-instance';
import { GetUserByIdUsecase, GottenUserDomainEvent } from '@skorify/domain/user';

export class CreateTournamentInstanceUsecaseImpl extends CreateTournamentInstanceUsecase {
  constructor(
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,
    private getUserByIdUsecase: GetUserByIdUsecase,

    private tournamentInstanceContract: TournamentInstanceContract,
  ) {
    super();
  }

  async call(param: CreateTournamentInstanceParam): Promise<DomainEvent> {
    const { name, ownerId, tournamentId } = param;

    const tournamentDE = await this.getTournamentByIdUsecase.call({
      tournamentId,
    });

    if (tournamentDE.isNot(GottenTournamentDomainEvent)) {
      return tournamentDE;
    }

    const ownerDE = await this.getUserByIdUsecase.call({
      userId: ownerId,
    });

    if (ownerDE.isNot(GottenUserDomainEvent)) {
      return ownerDE;
    }

    const exist = await this.tournamentInstanceContract.filter({ where: { name } });

    if (exist.length) {
      return TournamentInstanceWithSameNameDomainEvent(exist);
    }

    const tournamentInstanceDE = TournamentInstanceEntity.build({
      id: crypto.randomUUID(),
      name,
      tournamentId,
      ownerId,
      state: 'active',
    });

    if (tournamentInstanceDE.isNot(BuiltEntityDomainEvent)) {
      return tournamentInstanceDE;
    }

    const tournamentInstance = tournamentInstanceDE.payload;

    const saved = await this.tournamentInstanceContract.save(tournamentInstance);

    if (!saved) {
      return TournamentInstanceNotSavedDomainEvent();
    }

    return TournamentInstanceSavedDomainEvent(tournamentInstance);
  }
}
