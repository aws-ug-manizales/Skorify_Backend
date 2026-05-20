import { DomainEvent } from '../../core';
import { Entity, Id } from '../../core/entity';
export interface TeamAttributes {
    id: Id;
    name: string;
    shieldUrl?: string;
}
export declare class TeamEntity extends Entity {
    name: string;
    shieldUrl?: string;
    private constructor();
    static build(params: TeamAttributes): DomainEvent;
}
