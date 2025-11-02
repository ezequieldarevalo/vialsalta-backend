import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloqueObleas } from './entities/bloque-obleas.entity';
import { Oblea } from '../obleas/entities/oblea.entity';
import { Planta } from '../plantas/entities/planta.entity';
import { Camara } from '../camaras/entities/camara.entity';
import { BloquesService } from './bloques.service';
import { BloquesController } from './bloques.controller';

/**
 * Módulo de Bloques de Obleas
 */
@Module({
  imports: [TypeOrmModule.forFeature([BloqueObleas, Oblea, Planta, Camara])],
  controllers: [BloquesController],
  providers: [BloquesService],
  exports: [BloquesService, TypeOrmModule],
})
export class BloquesModule {}
