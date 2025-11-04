// migrate-olead-nullable.js
// Migración para hacer oleaId nullable en la tabla certificados

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'obleas_db',
  user: 'postgres',
  password: 'postgres',
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Iniciando migración: oleaId nullable en certificados...\n');
    
    // Verificar si la columna ya es nullable
    const checkQuery = `
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'certificados' 
      AND column_name = 'oleaid';
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows[0]?.is_nullable === 'YES') {
      console.log('✅ La columna oleaId ya es nullable. No se requiere migración.');
      return;
    }
    
    // Hacer oleaId nullable
    console.log('📝 Modificando columna oleaId para permitir NULL...');
    
    await client.query(`
      ALTER TABLE certificados 
      ALTER COLUMN "oleaId" DROP NOT NULL;
    `);
    
    console.log('✅ Columna oleaId modificada exitosamente');
    
    // También modificar el constraint unique para permitir múltiples NULL
    console.log('📝 Modificando constraint UNIQUE para permitir múltiples NULL...');
    
    await client.query(`
      DROP INDEX IF EXISTS "UQ_certificados_oleaId";
    `);
    
    await client.query(`
      CREATE UNIQUE INDEX "UQ_certificados_oleaId" 
      ON certificados ("oleaId") 
      WHERE "oleaId" IS NOT NULL;
    `);
    
    console.log('✅ Constraint UNIQUE modificado (permite múltiples NULL)');
    
    // Verificar el resultado
    const verifyQuery = `
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'certificados' 
      AND column_name = 'oleaid';
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('\n📊 Estado final de la columna:');
    console.log(verifyResult.rows[0]);
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('🎯 Ahora se pueden crear certificados CONDICIONALES sin oblea');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
