const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'obleas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function verObleas() {
  try {
    // Todas las obleas
    const todas = await pool.query('SELECT COUNT(*) FROM obleas');
    
    // Obleas asignadas
    const asignadas = await pool.query(`
      SELECT o.numero, o."codigoQr", r.id as revision_id
      FROM obleas o
      INNER JOIN revisiones r ON o.id = r."oleaId"
      ORDER BY o.numero
    `);
    
    // Obleas SIN asignar
    const disponibles = await pool.query(`
      SELECT o.id, o.numero, o."codigoQr", o."qrActivo"
      FROM obleas o
      WHERE o.id NOT IN (SELECT "oleaId" FROM revisiones WHERE "oleaId" IS NOT NULL)
      ORDER BY o.numero
      LIMIT 10
    `);
    
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                  ESTADO DE LAS OBLEAS                            ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 ESTADÍSTICAS:`);
    console.log(`   Total obleas: ${todas.rows[0].count}`);
    console.log(`   ✅ Asignadas: ${asignadas.rows.length}`);
    console.log(`   🟢 Disponibles: ${disponibles.rows.length}\n`);
    
    if (asignadas.rows.length > 0) {
      console.log('─'.repeat(70));
      console.log('🔒 OBLEAS YA ASIGNADAS:');
      console.log('─'.repeat(70) + '\n');
      asignadas.rows.forEach(oblea => {
        console.log(`   ❌ Oblea #${oblea.numero} → Revisión #${oblea.revision_id}`);
      });
      console.log('');
    }
    
    if (disponibles.rows.length > 0) {
      console.log('─'.repeat(70));
      console.log('🟢 OBLEAS DISPONIBLES PARA ASIGNAR:');
      console.log('─'.repeat(70) + '\n');
      
      disponibles.rows.forEach((oblea, index) => {
        console.log(`${index + 1}. Oblea #${oblea.numero}`);
        console.log(`   📱 URL para copiar:`);
        console.log(`   ${oblea.codigoQr}\n`);
      });
      
      console.log('─'.repeat(70));
      console.log('\n✅ USA ESTA URL PARA ASIGNAR A LA REVISIÓN #4:');
      console.log(`   ${disponibles.rows[0].codigoQr}\n`);
    } else {
      console.log('─'.repeat(70));
      console.log('❌ NO HAY OBLEAS DISPONIBLES');
      console.log('─'.repeat(70));
      console.log('\n💡 Necesitas crear un nuevo bloque de obleas:');
      console.log('   1. Ve a la página de Bloques como admin');
      console.log('   2. Crea un nuevo bloque (ej: 10 obleas)');
      console.log('   3. Descarga el CSV');
      console.log('   4. Luego podrás asignar esas obleas\n');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verObleas();
