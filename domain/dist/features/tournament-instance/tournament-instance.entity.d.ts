import { DomainEvent, Entity, Id } from '../../core';
export type TournamentInstanceState = 'active' | 'inactive' | 'supended' | 'terminated';
export interface TournamentInstanceAttributes {
    id: Id;
    name: string;
    ownerId: Id;
    tournamentId: Id;
    state: TournamentInstanceState;
    inviteCode: string;
}
export declare class TournamentInstanceEntity extends Entity {
    name: string;
    ownerId: Id;
    tournamentId: Id;
    state: TournamentInstanceState;
    inviteCode: string;
    private constructor();
    static build(params: TournamentInstanceAttributes): DomainEvent;
}
