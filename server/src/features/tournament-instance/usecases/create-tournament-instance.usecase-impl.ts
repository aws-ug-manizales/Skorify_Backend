import { BuiltEntityDomainEvent, DomainEvent } from '@skorify/domain/core';
import { GetTournamentByIdUsecase } from '@skorify/domain/tournament';
import {
  CreateTournamentInstanceParam,
  CreateTournamentInstanceUsecase,
  GetTournamentInstanceByInviteCodeUsecase,
  NotGottenTournamentInstanceDomainEvent,
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

    // const tournamentDE = await this.getTournamentByIdUsecase.call({
    //   tournamentId,
    // });

    // console.log('tournamentDE', tournamentDE);
    // if (tournamentDE.isNot(GottenTournamentDomainEvent)) {
    //   return tournamentDE;
    // }

    if (ownerId) {
      const ownerDE = await this.getUserByIdUsecase.call({
        userId: ownerId,
      });

      if (ownerDE.isNot(GottenUserDomainEvent)) {
        return ownerDE;
      }
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
      createdAt: new Date(),
    });

    if (tournamentInstanceDE.isNot(BuiltEntityDomainEvent)) {
      return tournamentInstanceDE;
    }

    const tournamentInstance = tournamentInstanceDE.payload;

    const saved = await this.tournamentInstanceContract.save(tournamentInstance);

    if (!saved) {
      return TournamentInstanceNotSavedDomainEvent();
    }

    // if (ownerId) {
    //   await this.createUserEnrollmentUsecase.call({
    //     userId: ownerId,
    //     tournamentInstanceId: tournamentInstance.id,
    //   });
    // }

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

      if (existing.is(NotGottenTournamentInstanceDomainEvent)) {
        return code;
      }
    }
    return null;
  }
}
