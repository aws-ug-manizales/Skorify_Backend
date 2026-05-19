import { BuiltEntityDomainEvent, DomainEvent, Entity, Id } from '../../core';

export interface TournamentInstanceAttributes {
  id: Id;
  name: string;
  ownerId: Id;
  tournamentId: Id;
  state: 'active' | 'inactive' | 'supended' | 'terminated';
}

export class TournamentInstanceEntity extends Entity {
  name: string;
  ownerId: Id;
  tournamentId: Id;
  state: 'active' | 'inactive' | 'supended' | 'terminated';

  private constructor(attributes: TournamentInstanceAttributes) {
    const { id, name, state, ownerId, tournamentId } = attributes;
    super(id, new Date());
    this.name = name;
    this.state = state;
    this.ownerId = ownerId;
    this.tournamentId = tournamentId;
  }

  static build(params: TournamentInstanceAttributes): DomainEvent {
    return BuiltEntityDomainEvent(new TournamentInstanceEntity(params));
  }
}
