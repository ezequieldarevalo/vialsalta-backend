import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'localhost'),
  port: parseInt(configService.get('POSTGRES_PORT', '5432'), 10),
  username: configService.get('POSTGRES_USER', 'postgres'),
  password: configService.get('POSTGRES_PASSWORD', 'postgres'),
  database: configService.get('POSTGRES_DB', 'obleas_db'),

  // Paths para migraciones
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],

  // 🔒 CRÍTICO: NUNCA usar synchronize con migraciones
  synchronize: false,

  // Logging: Solo errores en producción
  logging:
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'migration']
      : true,

  // Configuración de pool para migraciones
  extra: {
    max: 5, // Suficiente para migraciones
    connectionTimeoutMillis: 10000, // 10 segundos timeout
  },
});
