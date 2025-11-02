import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';

/**
 * Módulo de Municipios
 */
@Module({
  imports: [TypeOrmModule.forFeature([Municipio])],
  exports: [TypeOrmModule],
})
export class MunicipiosModule {}
