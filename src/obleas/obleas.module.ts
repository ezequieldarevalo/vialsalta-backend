import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oblea } from './entities/oblea.entity';

/**
 * Módulo de Obleas
 */
@Module({
  imports: [TypeOrmModule.forFeature([Oblea])],
  exports: [TypeOrmModule],
})
export class ObleasModule {}
