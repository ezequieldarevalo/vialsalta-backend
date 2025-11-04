const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'obleas_db',
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Agregar columna qrActivo
    await client.query(`
      ALTER TABLE obleas 
      ADD COLUMN IF NOT EXISTS "qrActivo" BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log('✅ Columna qrActivo agregada');

    // Agregar comentario
    await client.query(`
      COMMENT ON COLUMN obleas."qrActivo" IS 'Indica si el QR está activo. Se activa al asignar la oblea a una revisión.';
    `);
    console.log('✅ Comentario agregado');

    // Crear índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_obleas_qr_activo 
      ON obleas("qrActivo") 
      WHERE "qrActivo" = TRUE;
    `);
    console.log('✅ Índice creado');

    console.log('\n🎉 Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();
