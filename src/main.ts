import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Usar Winston como logger por defecto
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Servir archivos estáticos (uploads) en desarrollo
  const uploadDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos no permitidos
      forbidNonWhitelisted: true, // si vienen campos extra, 400
      transform: true, // transforma tipos a los declarados en DTOs
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = parseInt(config.get<string>('PORT', '3000'), 10);
  await app.listen(port);

  // Log de inicio
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`🚀 Application listening on port ${port}`, 'Bootstrap');
  logger.log(
    `📝 Environment: ${config.get('NODE_ENV', 'development')}`,
    'Bootstrap',
  );
  logger.log(
    `🔗 CORS enabled for: ${config.get('CORS_ORIGIN', 'http://localhost:5173')}`,
    'Bootstrap',
  );
}
bootstrap();
