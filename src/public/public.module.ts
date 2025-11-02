import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { CertificadosModule } from '../certificados/certificados.module';

@Module({
  imports: [CertificadosModule],
  controllers: [PublicController],
})
export class PublicModule {}
