import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Servicio de almacenamiento abstracto
 *
 * En desarrollo: guarda archivos localmente en /backend/uploads
 * En producción: subirá a DigitalOcean Spaces (S3) - preparado para migración
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly storageMode: 'local' | 's3';
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Determinar modo de almacenamiento según env
    this.storageMode = this.configService.get('STORAGE_MODE', 'local');

    // Directorio local para uploads (desarrollo)
    this.uploadDir = path.join(process.cwd(), 'uploads');

    // URL base para servir archivos
    this.baseUrl = this.configService.get(
      'STORAGE_BASE_URL',
      'http://localhost:3000/uploads',
    );

    this.logger.log(`Storage mode: ${this.storageMode}`);
    this.logger.log(`Upload directory: ${this.uploadDir}`);
    this.logger.log(`Base URL: ${this.baseUrl}`);

    // Crear directorio de uploads si no existe (modo local)
    if (this.storageMode === 'local') {
      this.ensureUploadDir();
    }
  }

  /**
   * Asegurar que el directorio de uploads existe
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      // Crear subdirectorios por tipo
      await fs.mkdir(path.join(this.uploadDir, 'vehiculos'), {
        recursive: true,
      });
      await fs.mkdir(path.join(this.uploadDir, 'temp'), { recursive: true });
      this.logger.log('Upload directories created');
    } catch (error) {
      this.logger.error('Error creating upload directories', error);
    }
  }

  /**
   * Comprimir imagen usando sharp
   * Reduce dimensiones a máximo 1920x1080 y calidad a 85%
   *
   * @param buffer - Buffer de la imagen original
   * @returns Buffer de la imagen comprimida
   */
  private async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      this.logger.warn('Error compressing image, using original', error);
      return buffer; // Si falla la compresión, usar original
    }
  }

  /**
   * Subir archivo (foto de vehículo)
   *
   * @param file - Buffer del archivo o Express.Multer.File
   * @param folder - Carpeta destino (ej: 'vehiculos', 'certificados')
   * @returns URL pública del archivo subido
   */
  async uploadFile(
    file: Buffer | Express.Multer.File,
    folder: string = 'vehiculos',
    originalName?: string,
  ): Promise<string> {
    if (this.storageMode === 'local') {
      return this.uploadFileLocal(file, folder, originalName);
    } else {
      return this.uploadFileS3(file, folder, originalName);
    }
  }

  /**
   * Upload local (desarrollo)
   */
  private async uploadFileLocal(
    file: Buffer | Express.Multer.File,
    folder: string,
    originalName?: string,
  ): Promise<string> {
    try {
      // Generar nombre único
      const ext = originalName ? path.extname(originalName) : '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const folderPath = path.join(this.uploadDir, folder);
      const filePath = path.join(folderPath, filename);

      // Asegurar que la carpeta existe
      await fs.mkdir(folderPath, { recursive: true });

      // Obtener buffer y comprimir imagen
      let buffer = Buffer.isBuffer(file) ? file : file.buffer;
      buffer = await this.compressImage(buffer);

      // Escribir archivo comprimido
      await fs.writeFile(filePath, buffer);

      // Retornar URL pública
      const publicUrl = `${this.baseUrl}/${folder}/${filename}`;
      this.logger.log(`File uploaded locally (compressed): ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file locally', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload a S3 (producción) - PREPARADO PARA MIGRACIÓN
   * Por ahora retorna error, se implementará cuando se configure Spaces
   */
  private async uploadFileS3(
    file: Buffer | Express.Multer.File,
    folder: string,
    originalName?: string,
  ): Promise<string> {
    // TODO: Implementar cuando se configure DigitalOcean Spaces
    // Usaremos AWS SDK v3 que es compatible con Spaces
    /*
    const s3Client = new S3Client({
      endpoint: this.configService.get('SPACES_ENDPOINT'),
      region: this.configService.get('SPACES_REGION'),
      credentials: {
        accessKeyId: this.configService.get('SPACES_KEY'),
        secretAccessKey: this.configService.get('SPACES_SECRET'),
      },
    });

    const ext = originalName ? path.extname(originalName) : '.jpg';
    const filename = `${folder}/${uuidv4()}${ext}`;
    const buffer = Buffer.isBuffer(file) ? file : file.buffer;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('SPACES_BUCKET'),
        Key: filename,
        Body: buffer,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
      }),
    );

    return `${this.configService.get('SPACES_CDN_URL')}/${filename}`;
    */

    throw new Error('S3 storage not yet implemented. Set STORAGE_MODE=local');
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (this.storageMode === 'local') {
      return this.deleteFileLocal(fileUrl);
    } else {
      return this.deleteFileS3(fileUrl);
    }
  }

  /**
   * Eliminar archivo local
   */
  private async deleteFileLocal(fileUrl: string): Promise<void> {
    try {
      // Extraer path relativo de la URL
      const urlPath = fileUrl.replace(this.baseUrl, '');
      const filePath = path.join(this.uploadDir, urlPath);

      await fs.unlink(filePath);
      this.logger.log(`File deleted locally: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Could not delete file: ${fileUrl}`, error);
    }
  }

  /**
   * Eliminar archivo de S3
   */
  private async deleteFileS3(fileUrl: string): Promise<void> {
    // TODO: Implementar con AWS SDK cuando se configure Spaces
    this.logger.warn('S3 delete not yet implemented');
  }

  /**
   * Obtener ruta local de uploads (para servir archivos estáticos)
   */
  getUploadDir(): string {
    return this.uploadDir;
  }
}
