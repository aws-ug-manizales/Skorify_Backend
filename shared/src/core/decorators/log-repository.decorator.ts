import { LoggerContext } from "../logger-context";

/**
 * Decorador @LogRepository
 * 
 * Envuelve métodos de repositories para registrar:
 * - Operación ejecutada (getById, save, deleteById, etc.)
 * - Parámetros de entrada
 * - Entidades afectadas
 * - Duración en ms
 * - Errores
 * 
 * Uso:
 * ```typescript
 * export class MatchRepository extends BaseRepository<MatchEntity> {
 *   @LogRepository()
 *   async getById(id: string): Promise<MatchEntity | null> {
 *     // implementación
 *   }
 * }
 * ```
 */
export function LogRepository() {
  return function (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const logger = LoggerContext.getLogger();
      const correlationId =
        LoggerContext.getCorrelationId() || LoggerContext.generateCorrelationId();

      const className = (target as { constructor: Function }).constructor.name;
      const methodName = String(propertyKey);
      const operationName = `${className}.${methodName}`;

      const startTime = Date.now();

      try {
        logger.debug(
          `[${correlationId}] Repository operation: ${operationName}`,
          {
            correlationId,
            operation: operationName,
            args,
          },
        );

        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        logger.debug(
          `[${correlationId}] Repository operation completed: ${operationName}`,
          {
            correlationId,
            operation: operationName,
            resultType: result?.constructor?.name || typeof result,
            duration,
          },
        );

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error(
          `[${correlationId}] Repository operation failed: ${operationName}`,
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
