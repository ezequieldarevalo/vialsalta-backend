import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // elimina campos no permitidos
    forbidNonWhitelisted: true, // si vienen campos extra, 400
    transform: true,            // transforma tipos a los declarados en DTOs
  }));

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  });

  const port = parseInt(config.get<string>('PORT', '3000'), 10);
  await app.listen(port);
}
bootstrap();
