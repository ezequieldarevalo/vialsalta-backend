import { Module, forwardRef } from '@nestjs/common';
import { RevisionesController } from './revisiones.controller';
import { RevisionesService } from './revisiones.service';
import { CertificadosModule } from '../certificados/certificados.module';

/**
 * Módulo de Revisiones Técnicas
 */
@Module({
  imports: [forwardRef(() => CertificadosModule)],
  controllers: [RevisionesController],
  providers: [RevisionesService],
  exports: [RevisionesService],
})
export class RevisionesModule {}
