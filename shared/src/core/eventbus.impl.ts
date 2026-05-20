import { EventBusContract, SentConfiguration } from '@skorify/domain/core';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

interface EventBusConfig {
  eventBusName: string;
  source: string;
}

export class EventBusImpl extends EventBusContract {
  private readonly client: EventBridgeClient;

  constructor(private eventBus: EventBusConfig) {
    super();
    this.client = new EventBridgeClient({ region: 'us-east-1' });
  }

  async send<T>(configuration: SentConfiguration<T>): Promise<void> {
    const params = {
      Entries: [
        {
          // El nombre del Event Bus de destino (si se omite, va al 'default')
          EventBusName: this.eventBus.eventBusName, // Variables de entorno

          // Origen del evento (identifica a tu aplicación)
          Source: this.eventBus.source,

          // Tipo de evento (útil para filtrar en las reglas)
          DetailType: configuration.domainEvent.eventName,

          // El contenido del mensaje (DEBE ser un string JSON)
          Detail: JSON.stringify(configuration.payload),

          Time: new Date(), // Opcional
        },
      ],
    };

    try {
      const command = new PutEventsCommand(params);
      const response = await this.client.send(command);
      console.log('Evento enviado con éxito:', response.Entries);
    } catch (error) {
      console.error('Error enviando el evento:', error);
    }
  }
}
