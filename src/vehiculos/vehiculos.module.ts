import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { TiposVehiculoModule } from '../tipos-vehiculo/tipos-vehiculo.module';

/**
 * Módulo de Vehículos
 */
@Module({
  imports: [TiposVehiculoModule],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}
