import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Usar Winston como logger por defecto
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security Headers con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:3000'],
        },
      },
      crossOriginEmbedderPolicy: false, // Permitir recursos externos
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permitir carga de imágenes desde frontend
    }),
  );

  // Compression para reducir tamaño de responses
  app.use(compression());

  // Sentry Exception Filter (solo si está configurado)
  if (config.get('SENTRY_DSN') && config.get('NODE_ENV') !== 'development') {
    app.useGlobalFilters(new SentryExceptionFilter());
  } else {
    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter());
  }

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

  // Swagger Documentation (solo en desarrollo)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sistema de Obleas - API')
      .setDescription(
        'API REST para el sistema de gestión de obleas de revisión técnica vehicular',
      )
      .setVersion('1.0')
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('plantas', 'Plantas de revisión técnica')
      .addTag('bloques', 'Bloques de obleas')
      .addTag('obleas', 'Obleas individuales')
      .addTag('vehiculos', 'Vehículos')
      .addTag('revisiones', 'Revisiones técnicas')
      .addTag('certificados', 'Certificados de RTV')
      .addTag('payments', 'Pagos y transacciones')
      .addTag('health', 'Health checks y monitoreo')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    logger.log('📚 Swagger docs available at /api/docs', 'Bootstrap');
  }

  const port = parseInt(config.get<string>('PORT', '3001'), 10);
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
  logger.log(`🔒 Security headers enabled (Helmet)`, 'Bootstrap');
  logger.log(`🗜️  Response compression enabled (gzip)`, 'Bootstrap');
}
bootstrap();
