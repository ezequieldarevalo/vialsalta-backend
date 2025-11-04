import { Throttle as NestThrottle } from '@nestjs/throttler';

/**
 * Decorador para configurar rate limiting personalizado en endpoints específicos
 *
 * @example
 * // Limitar a 10 requests por minuto
 * @Throttle({ default: { limit: 10, ttl: 60000 } })
 *
 * @example
 * // Limitar uploads a 5 por minuto
 * @Throttle({ default: { limit: 5, ttl: 60000 } })
 */
export { NestThrottle as Throttle };

/**
 * Límites predefinidos para casos comunes
 */
export const ThrottleLimits = {
  // Para uploads de archivos - más restrictivo
  UPLOAD: { default: { limit: 10, ttl: 60000 } }, // 10 uploads por minuto

  // Para endpoints de creación - moderado
  CREATE: { default: { limit: 30, ttl: 60000 } }, // 30 creaciones por minuto

  // Para búsquedas y consultas - permisivo
  READ: { default: { limit: 100, ttl: 60000 } }, // 100 consultas por minuto

  // Para endpoints públicos críticos
  PUBLIC: { default: { limit: 50, ttl: 60000 } }, // 50 requests por minuto
};
