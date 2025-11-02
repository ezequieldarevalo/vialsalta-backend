import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revision } from './entities/revision.entity';
import { Oblea } from '../obleas/entities/oblea.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { RevisionesController } from './revisiones.controller';
import { RevisionesService } from './revisiones.service';
import { CertificadosModule } from '../certificados/certificados.module';

/**
 * Módulo de Revisiones Técnicas
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Revision, Oblea, Vehiculo]),
    forwardRef(() => CertificadosModule),
  ],
  controllers: [RevisionesController],
  providers: [RevisionesService],
  exports: [TypeOrmModule, RevisionesService],
})
export class RevisionesModule {}
