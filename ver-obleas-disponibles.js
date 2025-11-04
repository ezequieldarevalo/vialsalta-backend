const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'obleas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function verObleasDisponibles() {
  try {
    const result = await pool.query(`
      SELECT o.id, o.numero, o."codigoQr", o."qrActivo", o."revisionId"
      FROM obleas o
      WHERE o."revisionId" IS NULL
      ORDER BY o.numero
      LIMIT 20
    `);
    
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║           OBLEAS DISPONIBLES PARA ASIGNAR                        ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay obleas disponibles para asignar\n');
      await pool.end();
      return;
    }
    
    console.log(`📊 Total obleas disponibles: ${result.rows.length}\n`);
    console.log('─'.repeat(70) + '\n');
    
    result.rows.slice(0, 5).forEach((oblea, index) => {
      console.log(`${index + 1}. Oblea #${oblea.numero}`);
      console.log(`   📱 Código QR completo:`);
      console.log(`      ${oblea.codigoQr}`);
      console.log(`   \n   ✏️  O ingresa solo el número:`);
      console.log(`      ${oblea.numero}`);
      console.log('');
    });
    
    console.log('─'.repeat(70));
    console.log('\n💡 CÓMO USAR:');
    console.log('');
    console.log('   Opción 1️⃣  - Con Scanner QR (Recomendado):');
    console.log('      • Click en "Asignar Oblea" en la revisión #4');
    console.log('      • Scanner escanea el QR de la oblea física');
    console.log('      • ¡Asignación automática!');
    console.log('');
    console.log('   Opción 2️⃣  - Pegando la URL:');
    console.log('      • Copia CUALQUIERA de las URLs de arriba');
    console.log('      • Pega en el campo de texto');
    console.log('      • Ejemplo: http://localhost:5173/verificar/OBL-1000000-...');
    console.log('');
    console.log('   Opción 3️⃣  - Ingreso manual del número:');
    console.log('      • Ingresa solo el número de oblea');
    console.log('      • Ejemplo: 1000000');
    console.log('      • (Pero esto NO activará el QR automáticamente)');
    console.log('');
    console.log('─'.repeat(70));
    console.log('\n✅ RECOMENDACIÓN: Usa la URL completa (Opción 2) para pruebas');
    console.log('   Ejemplo para copiar:');
    if (result.rows.length > 0) {
      console.log(`   ${result.rows[0].codigoQr}\n`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verObleasDisponibles();
