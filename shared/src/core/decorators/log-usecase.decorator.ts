import { LoggerContext } from "../logger-context";

/**
 * Decorador @LogUsecase
 * 
 * Envuelve el método `call()` de un use case para registrar:
 * - Entrada: parámetros de ejecución
 * - Salida: resultado (DomainEvent)
 * - Duración en ms
 * - CorrelationId para trazabilidad
 * - Errores y stack traces
 * 
 * Uso:
 * ```typescript
 * export class GetMatchByIdUsecaseImpl extends GetMatchByIdUsecase {
 *   @LogUsecase()
 *   async call(param: GetMatchByIdParam): Promise<DomainEvent> {
 *     // implementación
 *   }
 * }
 * ```
 */
export function LogUsecase() {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (param: unknown) {
      const logger = LoggerContext.getLogger();
      const correlationId =
        LoggerContext.getCorrelationId() || LoggerContext.generateCorrelationId();

      const className = (target as { constructor: Function }).constructor.name;
      const operationName = `${className}.${String(propertyKey)}`;

      const startTime = Date.now();

      try {
        logger.info(`[${correlationId}] Starting use case: ${operationName}`, {
          correlationId,
          operation: operationName,
          input: param,
        });

        const result = await originalMethod.call(this, param);
        const duration = Date.now() - startTime;

        logger.info(`[${correlationId}] Use case completed: ${operationName}`, {
          correlationId,
          operation: operationName,
          output: result,
          duration,
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error(
          `[${correlationId}] Use case failed: ${operationName}`,
          {
            correlationId,
            operation: operationName,
            duration,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        );

        throw error;
      }
    };

    return descriptor;
  };
}
