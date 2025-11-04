import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { Public } from '../common/decorators/public.decorator';
import {
  Throttle,
  ThrottleLimits,
} from '../common/decorators/throttle.decorator';

/**
 * Controlador de ejemplo para subir archivos
 * NOTA: Este es un endpoint de demostración
 * En producción, el upload de fotos debería estar en el módulo de revisiones o vehículos
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Endpoint de prueba para subir una foto
   *
   * Ejemplo con curl:
   * curl -X POST http://localhost:3000/upload/test \
   *   -F "file=@/path/to/image.jpg"
   *
   * Ejemplo con Postman/Insomnia:
   * - Method: POST
   * - URL: http://localhost:3000/upload/test
   * - Body: form-data
   * - Key: file (tipo File)
   * - Value: seleccionar imagen
   *
   * Rate limit: 10 uploads por minuto por IP (protección DDoS)
   */
  @Public()
  @Throttle(ThrottleLimits.UPLOAD) // Limitar a 10 uploads por minuto
  @Post('test')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTest(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    // Subir archivo (local en desarrollo, S3 en producción)
    const url = await this.storageService.uploadFile(
      file,
      'vehiculos',
      file.originalname,
    );

    return {
      message: 'File uploaded successfully',
      url,
    };
  }

  /**
   * Endpoint de información sobre el storage
   */
  @Public()
  @Get('info')
  getStorageInfo() {
    return {
      message: 'Storage service is ready',
      uploadDir: this.storageService.getUploadDir(),
      instructions: {
        development: 'Files are stored locally in /backend/uploads',
        production: 'Files will be uploaded to DigitalOcean Spaces (S3)',
        howToTest: 'POST /upload/test with form-data "file" field',
      },
    };
  }
}
