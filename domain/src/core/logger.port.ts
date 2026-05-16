/**
 * LoggerPort: Puerto que define el contrato de logging en el dominio.
 * 
 * No depende de librerías específicas. Implementaciones concretas 
 * (con Winston, Pino, etc.) residen en la capa de infraestructura.
 */
export interface LoggerPort {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}
