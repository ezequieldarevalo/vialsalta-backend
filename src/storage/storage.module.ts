import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { UploadController } from './upload.controller';

/**
 * Módulo global de almacenamiento
 * Disponible en toda la aplicación sin necesidad de importarlo
 */
@Global()
@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
