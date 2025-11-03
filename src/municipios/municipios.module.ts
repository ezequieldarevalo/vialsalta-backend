import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { MunicipiosService } from './municipios.service';
import { MunicipiosController } from './municipios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio])],
  controllers: [MunicipiosController],
  providers: [MunicipiosService],
  exports: [TypeOrmModule, MunicipiosService],
})
export class MunicipiosModule {}
