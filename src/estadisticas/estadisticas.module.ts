import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Revision } from '../revisiones/entities/revision.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { BloqueObleas } from '../bloques/entities/bloque-obleas.entity';

/**
 * Módulo de Estadísticas
 * Proporciona métricas y reportes de la planta
 */
@Module({
  imports: [TypeOrmModule.forFeature([Revision, Vehiculo, BloqueObleas])],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}
