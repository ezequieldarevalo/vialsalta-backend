const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'obleas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const QR_SECRET = process.env.QR_SECRET || 'default-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function generateQRCode(numero, bloqueId) {
  // Firma digital para evitar falsificaciones
  const signature = crypto
    .createHash('sha256')
    .update(`${numero}-${bloqueId}-${QR_SECRET}`)
    .digest('hex')
    .substring(0, 16);
  
  const codigo = `OBL-${numero}-${signature}`;
  
  // 🌐 URL completa de verificación
  return `${FRONTEND_URL}/verificar/${codigo}`;
}

async function migrateQRCodes() {
  console.log('🔄 Iniciando migración de códigos QR a URL completa...\n');
  
  try {
    // Obtener todas las obleas que NO tienen URL completa
    const result = await pool.query(`
      SELECT o.id, o.numero, o."codigoQr", o."bloqueId"
      FROM obleas o
      WHERE o."codigoQr" NOT LIKE 'http%'
      ORDER BY o.id
    `);
    
    console.log(`📊 Obleas encontradas sin URL completa: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('✅ Todas las obleas ya tienen URL completa. No hay nada que migrar.\n');
      await pool.end();
      return;
    }
    
    let actualizadas = 0;
    let errores = 0;
    
    for (const oblea of result.rows) {
      try {
        const nuevoQR = generateQRCode(oblea.numero, oblea.bloqueId);
        
        await pool.query(
          'UPDATE obleas SET "codigoQr" = $1 WHERE id = $2',
          [nuevoQR, oblea.id]
        );
        
        console.log(`✅ Oblea #${oblea.numero} (ID: ${oblea.id})`);
        console.log(`   Antes: ${oblea.codigoQr}`);
        console.log(`   Ahora: ${nuevoQR}\n`);
        
        actualizadas++;
      } catch (error) {
        console.error(`❌ Error al actualizar oblea #${oblea.numero}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(70));
    console.log(`Total obleas procesadas: ${result.rows.length}`);
    console.log(`✅ Actualizadas exitosamente: ${actualizadas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('='.repeat(70) + '\n');
    
    if (actualizadas > 0) {
      console.log('✅ Migración completada exitosamente!\n');
      console.log('📝 Las obleas ahora tienen códigos QR con URL completa:');
      console.log(`   Formato: ${FRONTEND_URL}/verificar/OBL-{numero}-{hash}\n`);
      console.log('📱 Ahora puedes usar el scanner para asignar estas obleas');
      console.log('   El scanner detectará automáticamente la URL completa\n');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar migración
migrateQRCodes()
  .then(() => {
    console.log('🎉 Proceso completado!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
