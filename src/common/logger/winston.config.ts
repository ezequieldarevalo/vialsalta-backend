import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de Winston Logger
 *
 * Características:
 * - Logs rotados diariamente (archivos separados por día)
 * - Retención: 30 días
 * - Tamaño máximo: 20MB por archivo
 * - Formato JSON para logs de producción (fácil de parsear)
 * - Formato colorizado para desarrollo
 * - Niveles: error, warn, info, debug
 */

const configService = new ConfigService();
const isProduction = configService.get('NODE_ENV') === 'production';

// Formato de log estructurado
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Formato para consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('Obleas', {
    colors: true,
    prettyPrint: true,
  }),
);

// Transport: Logs de error (archivo separado)
const errorFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d', // Guardar 30 días
  maxSize: '20m', // Máximo 20MB por archivo
  format: logFormat,
  handleExceptions: true,
  handleRejections: true,
});

// Transport: Logs combinados (todos los niveles)
const combinedFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  maxSize: '20m',
  format: logFormat,
});

// Transport: Logs de acceso HTTP (para auditoría)
const httpFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/http-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  maxSize: '20m',
  format: logFormat,
});

// Transports según entorno
const transports: winston.transport[] = [
  // Siempre log a consola
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat,
  }),
];

// En producción, agregar archivos
if (isProduction) {
  transports.push(errorFileTransport, combinedFileTransport, httpFileTransport);
} else {
  // En desarrollo también guardar logs (útil para debugging)
  transports.push(errorFileTransport, combinedFileTransport, httpFileTransport);
}

// Instancia de Winston
export const winstonConfig = {
  level: configService.get('LOG_LEVEL') || (isProduction ? 'info' : 'debug'),
  format: logFormat,
  transports,
  // No salir en caso de error de logging
  exitOnError: false,
};

// Logger para uso directo (opcional)
export const logger = winston.createLogger(winstonConfig);

// Helper para logear requests HTTP (para middleware)
export function logHttpRequest(
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  userId?: number,
  userRole?: string,
) {
  logger.info('HTTP Request', {
    type: 'http',
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId,
    userRole,
    timestamp: new Date().toISOString(),
  });
}

// Helper para logear errores con contexto
export function logError(
  message: string,
  error: Error,
  context?: Record<string, any>,
) {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
    timestamp: new Date().toISOString(),
  });
}

// Helper para logear acciones de seguridad
export function logSecurityEvent(
  event: string,
  userId?: number,
  details?: Record<string, any>,
) {
  logger.warn('Security Event', {
    type: 'security',
    event,
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
}
