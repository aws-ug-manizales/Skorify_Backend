import { DomainEventKind } from '../../core';
import { TeamEntity } from './team.entity';

export const TeamWithThatNameAlreadyExistsDomainEvent = DomainEventKind<TeamEntity>(
  'TeamWithThatNameAlreadyExistsDomainEvent',
);
export const TeamSavedDomainEvent = DomainEventKind<TeamEntity>('TeamSavedDomainEvent');
export const TeamNotSavedDomainEvent = DomainEventKind('TeamNotSavedDomainEvent');
export const GottenTeamDomainEvent = DomainEventKind<TeamEntity>('GottenTeamDomainEvent');
export const NotGottenTeamDomainEvent = DomainEventKind('NotGottenTeamDomainEvent');

export const TeamEditedDomainEvent = DomainEventKind<TeamEntity>('TeamEditedDomainEvent');
export const TeamNotEditedDomainEvent = DomainEventKind('TeamNotEditedDomainEvent');

export const GottenTeamsDomainEvent = DomainEventKind<TeamEntity[]>('GottenTeamsDomainEvent');
