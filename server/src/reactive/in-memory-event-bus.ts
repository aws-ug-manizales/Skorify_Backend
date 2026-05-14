import {
  DomainEvent,
  DomainEventKind,
  DomainEventKindWithPayload,
} from "@skorify/domain/core";
import {
  EventBusContract,
  GroupCompletionConfiguration,
  GroupConfiguration,
  SentConfiguration,
  EventHandler,
} from "@skorify/domain/core";

interface GroupInfo {
  groupId: string;
  expectedAmount: number;
  completedEvents: DomainEvent[];
  completionConfig?: GroupCompletionConfiguration<any>;
}

interface Subscription {
  domainEvent: DomainEventKind | DomainEventKindWithPayload<any>;
  handler: EventHandler<any>;
}

export class InMemoryEventBus extends EventBusContract {
  private groups: Map<string, GroupInfo> = new Map();
  private subscriptions: Subscription[] = [];

  async send<T>(configuration: SentConfiguration<T>): Promise<void> {
    const { domainEvent, groupId, payload } = configuration;
    const event = domainEvent(payload);

    // Ejecutar suscripciones que coinciden con el evento
    for (const subscription of this.subscriptions) {
      if (event.is(subscription.domainEvent)) {
        await subscription.handler(event);
      }
    }

    // Si el evento pertenece a un grupo, manejar la lógica del grupo
    if (groupId) {
      await this.handleGroupEvent(groupId, event);
    }
  }

  async group(configuration: GroupConfiguration): Promise<void> {
    const { groupId, amount } = configuration;
    
    this.groups.set(groupId, {
      groupId,
      expectedAmount: amount,
      completedEvents: [],
    });
  }

  async afterGroupCompletion<T>(
    configuration: GroupCompletionConfiguration<T>,
  ): Promise<void> {
    const { domainEvent, completionHandler, handler } = configuration;
    
    // Buscar el grupo que está asociado con este tipo de evento
    for (const [groupId, groupInfo] of this.groups.entries()) {
      groupInfo.completionConfig = {
        domainEvent,
        completionHandler,
        handler,
      };
    }
  }

  async on<T>(
    domainEvent: DomainEventKind | DomainEventKindWithPayload<T>,
    handler: EventHandler<T>,
  ): Promise<void> {
    this.subscriptions.push({
      domainEvent,
      handler,
    });
  }

  private async handleGroupEvent(groupId: string, event: DomainEvent): Promise<void> {
    const groupInfo = this.groups.get(groupId);
    
    if (!groupInfo) {
      console.warn(`Group ${groupId} not found`);
      return;
    }

    // Verificar si el evento cumple con el completion handler
    if (groupInfo.completionConfig) {
      const { completionHandler, handler } = groupInfo.completionConfig;
      
      if (completionHandler(event)) {
        groupInfo.completedEvents.push(event);
        
        // Verificar si todos los eventos esperados se completaron
        if (groupInfo.completedEvents.length >= groupInfo.expectedAmount) {
          await handler(groupInfo.completedEvents);
          // Limpiar el grupo después de completar
          this.groups.delete(groupId);
        }
      }
    }
  }
}
