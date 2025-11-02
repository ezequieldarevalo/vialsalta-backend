import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camara } from './entities/camara.entity';

/**
 * Módulo de Cámaras Provinciales
 */
@Module({
  imports: [TypeOrmModule.forFeature([Camara])],
  exports: [TypeOrmModule],
})
export class CamarasModule {}
