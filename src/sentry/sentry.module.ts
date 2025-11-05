import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Módulo global para inicializar Sentry monitoring
 * Solo se activa si SENTRY_DSN está configurado y no estamos en desarrollo
 */
@Global()
@Module({
  imports: [ConfigModule],
})
export class SentryModule {
  constructor(private config: ConfigService) {
    const dsn = this.config.get<string>('SENTRY_DSN');
    const environment = this.config.get<string>('NODE_ENV', 'development');

    // Solo inicializar Sentry si hay DSN y no estamos en desarrollo
    if (dsn && environment !== 'development') {
      Sentry.init({
        dsn,
        environment,
        // Sample 10% de las transacciones
        tracesSampleRate: 0.1,
        // Sample 10% de los perfiles de rendimiento
        profilesSampleRate: 0.1,
        integrations: [nodeProfilingIntegration()],
        // Remover información sensible antes de enviar
        beforeSend(event) {
          if (event.request?.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
          return event;
        },
      });
      console.log('✅ Sentry initialized for environment:', environment);
    } else {
      console.log('ℹ️  Sentry disabled (no DSN or development mode)');
    }
  }
}
