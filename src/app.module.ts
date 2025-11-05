import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicModule } from './public/public.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CamarasModule } from './camaras/camaras.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { PlantasModule } from './plantas/plantas.module';
import { BloquesModule } from './bloques/bloques.module';
import { ObleasModule } from './obleas/obleas.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { RevisionesModule } from './revisiones/revisiones.module';
import { CertificadosModule } from './certificados/certificados.module';
import { TiposVehiculoModule } from './tipos-vehiculo/tipos-vehiculo.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { DemoModule } from './demo/demo.module';
import { PaymentsModule } from './payments/payments.module';
import { StorageModule } from './storage/storage.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { winstonConfig } from './common/logger/winston.config';
import { HealthModule } from './health/health.module';
import { EmailModule } from './common/services/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheConfigModule } from './cache/cache.module';
import { SentryModule } from './sentry/sentry.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Sentry - Error monitoring
    SentryModule,
    // Redis Cache - Performance optimization
    CacheConfigModule,
    // Logging profesional con Winston
    WinstonModule.forRoot(winstonConfig),
    // Email service global
    EmailModule,
    // Rate Limiting - Protección contra DDoS
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests por minuto por IP (global)
      },
    ]),
    StorageModule,
    // Prisma ORM - Database access layer
    PrismaModule,
    // Módulos de negocio
    UsersModule,
    CamarasModule,
    MunicipiosModule,
    PlantasModule,
    BloquesModule,
    ObleasModule,
    VehiculosModule,
    RevisionesModule,
    CertificadosModule,
    TiposVehiculoModule,
    EstadisticasModule,
    // Módulos funcionales
    PublicModule,
    AuthModule,
    PaymentsModule,
    DemoModule, // Módulo de prueba para demostrar guards (eliminar en producción)
    HealthModule, // Health checks para monitoreo
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de Rate Limiting personalizado por roles
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Guard global de JWT - Protege todos los endpoints excepto los marcados con @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard global de Roles - Verifica permisos después de la autenticación
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware de logging HTTP a todas las rutas
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
