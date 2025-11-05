import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';

/**
 * Módulo de Estadísticas
 * Proporciona métricas y reportes de la planta
 * Migrado a Prisma ORM
 */
@Module({
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}
