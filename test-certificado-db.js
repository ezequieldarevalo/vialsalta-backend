const { DataSource } = require('typeorm');

async function test() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'obleas_db',
  });

  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos');

  const result = await dataSource.query(
    'SELECT id, "revisionId", "numeroCertificado", LENGTH("codigoQr") as largo, "codigoQr" FROM certificados WHERE "revisionId" = 2'
  );

  console.log('\n📊 Certificado de revisión #2:');
  console.log('ID:', result[0].id);
  console.log('Número:', result[0].numeroCertificado);
  console.log('Tiene codigoQr:', !!result[0].codigoQr);
  console.log('Longitud codigoQr:', result[0].largo);
  console.log('Inicio codigoQr:', result[0].codigoQr ? result[0].codigoQr.substring(0, 50) : 'null');

  await dataSource.destroy();
}

test().catch(console.error);
