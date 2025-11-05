import { Module } from '@nestjs/common';
import { TiposVehiculoService } from './tipos-vehiculo.service';
import { TiposVehiculoController } from './tipos-vehiculo.controller';

@Module({
  controllers: [TiposVehiculoController],
  providers: [TiposVehiculoService],
  exports: [TiposVehiculoService],
})
export class TiposVehiculoModule {}
