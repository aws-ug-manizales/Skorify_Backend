import { LoggerPort } from "@skorify/domain/core";
import { Logger } from "@scifamek-open-source/logger";
import * as path from "path";

/**
 * LoggerAdapter: Implementación del puerto LoggerPort usando @scifamek-open-source/logger.
 * 
 * Proporciona logging estructurado en archivos separados por nivel:
 * - logs/application.log: Información operacional
 * - logs/errors.log: Errores y excepciones
 */
export class LoggerAdapter implements LoggerPort {
  private applicationLogger: Logger;
  private errorLogger: Logger;
  private readonly logsFolder: string;

  constructor(logsFolder: string = "logs") {
    this.logsFolder = logsFolder;
    this.applicationLogger = new Logger(path.join(logsFolder, "application.log"));
    this.errorLogger = new Logger(path.join(logsFolder, "errors.log"));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logMessage("INFO", message, context, this.applicationLogger);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logMessage("WARN", message, context, this.applicationLogger);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logMessage("ERROR", message, context, this.errorLogger);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logMessage("DEBUG", message, context, this.applicationLogger);
  }

  /**
   * Método privado que formatea y escribe el log estructurado.
   * Incluye timestamp, nivel, mensaje y contexto adicional.
   */
  private logMessage(
    level: "INFO" | "WARN" | "ERROR" | "DEBUG",
    message: string,
    context: Record<string, unknown> | undefined,
    logger: Logger,
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
    };

    // Usar el logger para escribir la entrada formateada
    // Logger.log() acepta (level: string, data: any)
    logger.log(level, JSON.stringify(logEntry));
  }
}
