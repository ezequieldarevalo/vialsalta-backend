import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposVehiculoService } from './tipos-vehiculo.service';
import { TiposVehiculoController } from './tipos-vehiculo.controller';
import { TipoVehiculo } from './entities/tipo-vehiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoVehiculo])],
  controllers: [TiposVehiculoController],
  providers: [TiposVehiculoService],
  exports: [TiposVehiculoService],
})
export class TiposVehiculoModule {}
