import { DomainEvent } from '../../core';
import { BaseAttributes, Entity, Id } from '../../core/entity';
export interface UserAttributes extends BaseAttributes {
    id: Id;
    name: string;
    isActive: boolean;
    notificationToken: string;
    email: string;
    image?: string;
}
export declare class UserEntity extends Entity {
    name: string;
    isActive: boolean;
    notificationToken: string;
    email: string;
    image?: string;
    private constructor();
    static build(params: UserAttributes): DomainEvent;
}
