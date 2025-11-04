import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para logear todas las peticiones HTTP
 *
 * Registra:
 * - Método HTTP (GET, POST, etc.)
 * - URL solicitada
 * - Código de respuesta (200, 404, 500, etc.)
 * - Tiempo de respuesta en milisegundos
 * - Usuario autenticado (si existe)
 * - IP del cliente
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Cuando la respuesta termina
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const user = (req as any).user;

      // Color según código de estado
      const statusColor =
        statusCode >= 500
          ? '\x1b[31m' // Rojo para errores de servidor
          : statusCode >= 400
            ? '\x1b[33m' // Amarillo para errores de cliente
            : statusCode >= 300
              ? '\x1b[36m' // Cyan para redirecciones
              : '\x1b[32m'; // Verde para éxito

      const resetColor = '\x1b[0m';

      // Log estructurado
      const logMessage = `${method} ${originalUrl} ${statusColor}${statusCode}${resetColor} ${responseTime}ms`;

      // Agregar información de usuario si está autenticado
      const metadata = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent,
        ...(user && {
          userId: user.id,
          userRole: user.role,
          userEmail: user.email,
        }),
      };

      // Nivel de log según status
      if (statusCode >= 500) {
        this.logger.error(logMessage, metadata);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, metadata);
      } else {
        this.logger.log(logMessage, metadata);
      }

      // Alertar sobre requests lentos (>2 segundos)
      if (responseTime > 2000) {
        this.logger.warn(
          `Slow request detected: ${method} ${originalUrl} took ${responseTime}ms`,
          metadata,
        );
      }
    });

    next();
  }
}
