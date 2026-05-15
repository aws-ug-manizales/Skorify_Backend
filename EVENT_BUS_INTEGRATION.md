# Integración del Bus de Eventos con AWS

## Resumen

Este documento describe la integración del bus de eventos de Skorify con servicios de AWS. La arquitectura sigue el principio de que **Defensas define la API del contrato y Arqueros implementa el sistema de comunicación asíncrona**.

## Arquitectura Actual

### Contrato (Definido por Defensas)

El contrato del EventBus está definido en `domain/src/core/eventbus.contract.ts`:

```typescript
export abstract class EventBusContract {
  abstract send<T>(configuration: SentConfiguration<T>): void | Promise<void>;
  abstract group(configuration: GroupConfiguration): void | Promise<void>;
  abstract afterGroupCompletion<T>(
    configuration: GroupCompletionConfiguration<T>,
  ): void | Promise<void>;
  abstract on<T>(
    domainEvent: DomainEventKind | DomainEventKindWithPayload<T>,
    handler: EventHandler<T>,
  ): void | Promise<void>;
}
```

### Implementación Actual (Arqueros)

Actualmente tenemos una implementación en memoria en `server/src/reactive/in-memory-event-bus.ts` que sirve como prueba de concepto y para desarrollo local.

### 1. Nueva Implementación de EventBusContract

El equipo de Datos debe crear una nueva implementación de `EventBusContract` que use AWS SQS y DynamoDB. Esta implementación debe:

```typescript
export class AwsEventBus extends EventBusContract {
  constructor(
    private sqsClient: SQSClient,
    private dynamoDbClient: DynamoDBClient,
    private queueUrl: string,
    private tableName: string,
  ) {}

  async send<T>(configuration: SentConfiguration<T>): Promise<void> {
    // Enviar mensaje a SQS
    // Si tiene groupId, actualizar estado en DynamoDB
  }

  async group(configuration: GroupConfiguration): Promise<void> {
    // Crear registro en DynamoDB para el grupo
    // Inicializar contador de eventos completados
  }

  async afterGroupCompletion<T>(
    configuration: GroupCompletionConfiguration<T>,
  ): Promise<void> {
    // Configurar trigger en DynamoDB (DynamoDB Streams)
    // O usar Lambda que monitorea cambios en la tabla
  }

  async on<T>(
    domainEvent: DomainEventKind | DomainEventKindWithPayload<T>,
    handler: EventHandler<T>,
  ): Promise<void> {
    // Configurar SQS queue listener
    // O usar Lambda triggered por SQS
  }
}
```

### 2. Configuración de Infraestructura

El equipo de Datos debe proporcionar:
- **Terraform/CloudFormation templates** para crear:
  - SQS Queue (FIFO)
  - DynamoDB Table
  - IAM Roles
  - Lambda functions (si aplica)

### 3. Variables de Entorno

```env
AWS_REGION=us-east-1
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/skorify-events.fifo
DYNAMODB_TABLE_NAME=skorify-event-groups
```