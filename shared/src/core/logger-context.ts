import { LoggerPort } from "@skorify/domain/core";
import { randomUUID } from "crypto";

/**
 * LoggerContext: Gestor centralizado del logger y correlationId.
 * 
 * Mantiene el estado del logger actual y el correlationId activo,
 * permitiendo que decoradores y otros componentes accedan a ellos
 * sin necesidad de inyección en cada clase.
 * 
 * Para aplicaciones con concurrencia, considerar usar AsyncLocalStorage.
 */
class LoggerContextClass {
  private static logger: LoggerPort | null = null;
  private static correlationId: string | null = null;

  /**
   * Inicializa el contexto con una instancia de logger.
   * Llamar una sola vez en bootstrap de la aplicación.
   */
  static initialize(logger: LoggerPort): void {
    LoggerContextClass.logger = logger;
  }

  /**
   * Obtiene la instancia actual de logger.
   * Lanza error si no ha sido inicializado.
   */
  static getLogger(): LoggerPort {
    if (!LoggerContextClass.logger) {
      throw new Error(
        "LoggerContext no ha sido inicializado. Llamar LoggerContext.initialize() en bootstrap.",
      );
    }
    return LoggerContextClass.logger;
  }

  /**
   * Genera un nuevo correlationId único.
   */
  static generateCorrelationId(): string {
    const newId = randomUUID();
    LoggerContextClass.correlationId = newId;
    return newId;
  }

  /**
   * Obtiene el correlationId actual, o null si no hay uno activo.
   */
  static getCorrelationId(): string | null {
    return LoggerContextClass.correlationId;
  }

  /**
   * Establece el correlationId (útil para propagarlo desde requests HTTP).
   */
  static setCorrelationId(id: string): void {
    LoggerContextClass.correlationId = id;
  }

  /**
   * Limpia el correlationId (llamar al final de un request).
   */
  static clearCorrelationId(): void {
    LoggerContextClass.correlationId = null;
  }
}

export const LoggerContext = LoggerContextClass;
