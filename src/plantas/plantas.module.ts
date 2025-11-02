import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planta } from './entities/planta.entity';
import { PlantasService } from './plantas.service';
import { PlantasController } from './plantas.controller';

/**
 * Módulo de Plantas RTV
 */
@Module({
  imports: [TypeOrmModule.forFeature([Planta])],
  controllers: [PlantasController],
  providers: [PlantasService],
  exports: [TypeOrmModule, PlantasService],
})
export class PlantasModule {}
