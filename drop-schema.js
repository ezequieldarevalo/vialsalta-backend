const { Client } = require('pg');

async function dropSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'obleas_db',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Eliminar el esquema completo (TODAS las tablas, índices, tipos, etc.)
    await client.query('DROP SCHEMA public CASCADE');
    console.log('✅ Esquema public eliminado');

    // Recrear el esquema limpio
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO postgres');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    console.log('✅ Esquema public recreado');

    await client.end();
    console.log('\n🎉 Base de datos limpia y lista para TypeORM synchronize');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropSchema();
