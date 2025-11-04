import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { TiposVehiculoModule } from '../tipos-vehiculo/tipos-vehiculo.module';

/**
 * Módulo de Vehículos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo]),
    TiposVehiculoModule,
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [TypeOrmModule, VehiculosService],
})
export class VehiculosModule {}
