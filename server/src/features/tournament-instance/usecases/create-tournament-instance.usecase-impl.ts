import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import { GetTournamentByIdUsecase, GottenTournamentDomainEvent } from '@skorify/domain/tournament';
import {
  CreateTournamentInstanceParam,
  CreateTournamentInstanceUsecase,
  GetTournamentInstanceByInviteCodeUsecase,
  GottenTournamentInstanceDomainEvent,
  TournamentInstanceContract,
  TournamentInstanceEntity,
  TournamentInstanceNotSavedDomainEvent,
  TournamentInstanceSavedDomainEvent,
  TournamentInstanceWithSameNameDomainEvent,
} from '@skorify/domain/tournament-instance';
import { GetUserByIdUsecase, GottenUserDomainEvent } from '@skorify/domain/user';
import { CreateUserEnrollmentUsecase } from '@skorify/domain/user-enrollment';

export class CreateTournamentInstanceUsecaseImpl extends CreateTournamentInstanceUsecase {
  constructor(
    private getTournamentByIdUsecase: GetTournamentByIdUsecase,
    private getUserByIdUsecase: GetUserByIdUsecase,

    private tournamentInstanceContract: TournamentInstanceContract,
    private createUserEnrollmentUsecase: CreateUserEnrollmentUsecase,
    private getTournamentInstanceByInviteCodeUsecase: GetTournamentInstanceByInviteCodeUsecase,
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

    const inviteCode = await this.generateUniqueInviteCode();

    if (!inviteCode) {
      return TournamentInstanceNotSavedDomainEvent();
    }

    const tournamentInstanceDE = TournamentInstanceEntity.build({
      id: crypto.randomUUID(),
      name,
      tournamentId,
      ownerId,
      state: 'active',
      inviteCode,
    });

    if (tournamentInstanceDE.isNot(BuiltEntityDomainEvent)) {
      return tournamentInstanceDE;
    }

    const tournamentInstance = tournamentInstanceDE.payload;

    const saved = await this.tournamentInstanceContract.save(tournamentInstance);

    if (!saved) {
      return TournamentInstanceNotSavedDomainEvent();
    }

    await this.createUserEnrollmentUsecase.call({
      userId: ownerId,
      tournamentInstanceId: tournamentInstance.id,
    });

    return TournamentInstanceSavedDomainEvent(tournamentInstance);
  }

  private async generateUniqueInviteCode(): Promise<string | null> {
    const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const LENGTH = 8;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      let code = '';
      for (let i = 0; i < LENGTH; i += 1) {
        code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }

      const existing = await this.getTournamentInstanceByInviteCodeUsecase.call({
        inviteCode: code,
        state: 'active',
      });

      if (existing.is(GottenTournamentInstanceDomainEvent)) {
        return code;
      }
    }
    return null;
  }
}
