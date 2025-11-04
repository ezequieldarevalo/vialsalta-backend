const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'obleas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkObleas() {
  try {
    const result = await pool.query(`
      SELECT o.id, o.numero, o."codigoQr", o."qrActivo", o."revisionId"
      FROM obleas o
      ORDER BY o.numero
      LIMIT 10
    `);
    
    console.log('📋 Primeras 10 obleas:\n');
    result.rows.forEach(oblea => {
      console.log(`Oblea #${oblea.numero} (ID: ${oblea.id})`);
      console.log(`  Código QR: ${oblea.codigoQr}`);
      console.log(`  QR Activo: ${oblea.qrActivo}`);
      console.log(`  Revisión ID: ${oblea.revisionId || 'Sin asignar'}\n`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkObleas();
