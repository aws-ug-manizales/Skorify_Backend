import { BuiltEntityDomainEvent, DomainEvent, Entity, Id } from '../../core';

export type TournamentInstanceState = 'active' | 'inactive' | 'supended' | 'terminated';
export interface TournamentInstanceAttributes {
  id: Id;
  name: string;
  ownerId: Id;
  tournamentId: Id;
  state: TournamentInstanceState;
  inviteCode: string;
}

export class TournamentInstanceEntity extends Entity {
  name: string;
  ownerId: Id;
  tournamentId: Id;
  state: TournamentInstanceState;
  inviteCode: string;

  private constructor(attributes: TournamentInstanceAttributes) {
    const { id, name, state, ownerId, tournamentId, inviteCode } = attributes;
    super(id, new Date());
    this.name = name;
    this.state = state;
    this.ownerId = ownerId;
    this.tournamentId = tournamentId;
    this.inviteCode = inviteCode;
  }

  static build(params: TournamentInstanceAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new TournamentInstanceEntity(params));
  }
}
