import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
import { DemoModule } from './demo/demo.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: parseInt(config.get<string>('POSTGRES_PORT', '5432'), 10),
        username: config.get<string>('POSTGRES_USER', 'postgres'),
        password: config.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: config.get<string>('POSTGRES_DB', 'obleas_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
export class AppModule {}
