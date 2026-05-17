import { EventBusContract, SentConfiguration } from '@skorify/domain/core';
import { EventRecord, Queue } from './queue';

export class EventBusMemoryImpl extends EventBusContract {
  constructor(private queue: Queue) {
    super();
  }

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
    this.queue.events.push(eventRecord);

    // Notificar a los handlers suscritos
    const handlers = this.queue.handlers.get(eventRecord.domainEvent);
    if (handlers && handlers.size > 0) {
      const promises = Array.from(handlers).map((handler) =>
        Promise.resolve(handler(configuration.payload)),
      );

      try {
        await Promise.all(promises);
        console.log(
          `Evento '${eventRecord.domainEvent}' procesado por ${handlers.size} handler(s)`,
        );
      } catch (error) {
        console.error(`Error procesando evento '${eventRecord.domainEvent}':`, error);
        throw error;
      }
    } else {
      console.log(`Evento '${eventRecord.domainEvent}' almacenado (sin handlers)`);
    }
  }
}
