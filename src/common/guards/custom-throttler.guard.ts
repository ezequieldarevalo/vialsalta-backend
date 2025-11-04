import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { UserRole } from '../enums';

/**
 * Guard de Rate Limiting personalizado por roles
 *
 * Límites según tipo de usuario (optimizados para carga real):
 *
 * Contexto: Cada planta hace ~500 revisiones/mes = ~25 revisiones/día = ~3 revisiones/hora
 * Cada revisión = ~18 requests → ~54 requests/hora por planta en operación normal
 *
 * - MUNICIPIO: Sin límite (administradores del sistema)
 * - CAMARA: 200 req/min (supervisan múltiples plantas, consultas de reportes)
 * - PLANTA_ADMIN/PLANTA_OPERADOR: 100 req/min (amplio margen sobre 1 req/min promedio)
 * - Público/No autenticado: 30 req/min (verificación QR, prevención de scraping)
 *
 * Estos límites permiten:
 * - Planta: Hasta 100× su carga normal (picos, días especiales)
 * - Sistema: Escalar a 1000+ plantas sin problemas
 * - Seguridad: Protección efectiva contra DDoS sin afectar uso legítimo
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Usar IP como tracker por defecto
    return Promise.resolve(req.ip || 'unknown');
  }

  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // MUNICIPIO: Sin límite (administradores)
    if (user?.role === UserRole.MUNICIPIO) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  protected getThrottlerLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Límites por rol (optimizados para carga real: ~500 revisiones/mes por planta)
    if (user?.role === UserRole.CAMARA) {
      return Promise.resolve(200); // 200 req/min - consultas de reportes, supervisión
    }

    if (
      user?.role === UserRole.PLANTA_ADMIN ||
      user?.role === UserRole.PLANTA_OPERADOR
    ) {
      return Promise.resolve(100); // 100 req/min - 100× margen sobre uso normal (~1 req/min)
    }

    // Usuarios públicos o no autenticados
    return Promise.resolve(30); // 30 req/min - verificación QR, prevención scraping
  }

  protected getThrottlerTtl(_context: ExecutionContext): Promise<number> {
    // TTL fijo de 60 segundos para todos
    return Promise.resolve(60000);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = user?.role || 'público';
    const limit = await this.getThrottlerLimit(context);

    throw new ThrottlerException(
      `Rate limit excedido para rol '${role}'. Límite: ${limit} requests por minuto. Por favor, espera 60 segundos.`,
    );
  }
}
