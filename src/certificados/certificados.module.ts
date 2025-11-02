import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from './entities/certificado.entity';
import { Revision } from '../revisiones/entities/revision.entity';
import { CertificadosService } from './certificados.service';
import { CertificadosController } from './certificados.controller';

/**
 * Módulo de Certificados
 */
@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Revision])],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService, TypeOrmModule],
})
export class CertificadosModule {}
