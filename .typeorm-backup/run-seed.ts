import { DataSource } from 'typeorm';
import { seedTiposVehiculo } from './seed-tipos';
import { TipoVehiculo } from './entities/tipo-vehiculo.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'obleas_db',
  entities: [TipoVehiculo],
  synchronize: false,
});

async function run() {
  console.log('🌱 Iniciando seed de tipos de vehículos...');
  
  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    await seedTiposVehiculo(dataSource);
    
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

run();
