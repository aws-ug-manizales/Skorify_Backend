import { EventBusContract, SentConfiguration } from '@skorify/domain/core';

interface EventRecord<T = any> {
  domainEvent: string;
  payload: T;
  timestamp: Date;
}

type EventHandler<T = any> = (payload: T) => void | Promise<void>;

export class EventBusMemoryImpl extends EventBusContract {
  private readonly events: EventRecord[] = [];
  private readonly handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Envía un evento al bus en memoria
   * @param configuration Configuración del evento a enviar
   */
  async send<T>(configuration: SentConfiguration<T>): Promise<void> {
    const eventRecord: EventRecord<T> = {
      domainEvent: configuration.domainEvent.eventName,
      payload: configuration.payload,
      timestamp: new Date(),
    };

    // Almacenar el evento en el historial
    this.events.push(eventRecord);

    // Notificar a los handlers suscritos
    const handlers = this.handlers.get(eventRecord.domainEvent);
    if (handlers && handlers.size > 0) {
      const promises = Array.from(handlers).map(handler => 
        Promise.resolve(handler(configuration.payload))
      );
      
      try {
        await Promise.all(promises);
        console.log(`Evento '${eventRecord.domainEvent}' procesado por ${handlers.size} handler(s)`);
      } catch (error) {
        console.error(`Error procesando evento '${eventRecord.domainEvent}':`, error);
        throw error;
      }
    } else {
      console.log(`Evento '${eventRecord.domainEvent}' almacenado (sin handlers)`);
    }
  }

  /**
   * Suscribe un handler a un tipo de evento específico
   * @param eventName Nombre del evento al que suscribirse
   * @param handler Función que manejará el evento
   */
  subscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler as EventHandler);
  }

  /**
   * Desuscribe un handler de un tipo de evento
   * @param eventName Nombre del evento
   * @param handler Handler a desuscribir
   */
  unsubscribe<T = any>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  /**
   * Obtiene todos los eventos almacenados
   * @returns Array de eventos registrados
   */
  getEvents(): ReadonlyArray<EventRecord> {
    return [...this.events];
  }

  /**
   * Obtiene eventos filtrados por nombre de evento
   * @param eventName Nombre del evento a filtrar
   * @returns Array de eventos del tipo especificado
   */
  getEventsByType(eventName: string): ReadonlyArray<EventRecord> {
    return this.events.filter(e => e.domainEvent === eventName);
  }

  /**
   * Limpia todos los eventos almacenados
   */
  clearEvents(): void {
    this.events.length = 0;
  }

  /**
   * Limpia todos los handlers suscritos
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Obtiene estadísticas del bus de eventos
   */
  getStats() {
    const eventCounts = new Map<string, number>();
    
    for (const event of this.events) {
      const count = eventCounts.get(event.domainEvent) || 0;
      eventCounts.set(event.domainEvent, count + 1);
    }

    return {
      totalEvents: this.events.length,
      subscribedEventTypes: this.handlers.size,
      eventCounts: Object.fromEntries(eventCounts),
      handlers: Array.from(this.handlers.entries()).map(([eventName, handlers]) => ({
        eventName,
        handlerCount: handlers.size,
      })),
    };
  }
}