import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Cámara
  const camara = await prisma.camaras.upsert({
    where: { codigo: 'CAM-SLT01' },
    update: {},
    create: {
      nombre: 'Cámara de Talleres de Salta',
      provincia: 'Salta',
      codigo: 'CAM-SLT01',
      rangoInicio: 1000000,
      rangoFin: 9999999,
      cuit: '30-12345678-9',
      direccion: 'Av. Argentina 123, Salta Capital',
      telefono: '387-4123456',
      email: 'contacto@camarasalta.org.ar',
      activa: true,
    },
  });
  console.log('✅ Cámara creada:', camara.nombre);

  // 2. Crear Municipios
  const municipioCapital = await prisma.municipios.upsert({
    where: { codigo: 'MUN-CAP' },
    update: {},
    create: {
      camaraId: camara.id,
      nombre: 'Municipalidad de Salta',
      codigo: 'MUN-CAP',
      porcentajeReparto: 40.0,
      activo: true,
    },
  });
  console.log('✅ Municipio creado:', municipioCapital.nombre);

  const municipioCerrillos = await prisma.municipios.upsert({
    where: { codigo: 'MUN-CER' },
    update: {},
    create: {
      camaraId: camara.id,
      nombre: 'Municipalidad de Cerrillos',
      codigo: 'MUN-CER',
      porcentajeReparto: 30.0,
      activo: true,
    },
  });
  console.log('✅ Municipio creado:', municipioCerrillos.nombre);

  // 3. Crear Plantas
  const plantaCentro = await prisma.plantas.upsert({
    where: { codigoHabilitacion: 'PLT-CENTRO' },
    update: {},
    create: {
      camaraId: camara.id,
      municipioId: municipioCapital.id,
      nombre: 'VTV Salta Centro',
      cuit: '30-98765432-1',
      direccion: 'Av. Entre Ríos 123, Salta Capital',
      codigoHabilitacion: 'PLT-CENTRO',
      telefono: '387-4111111',
      email: 'info@vtvsalta.com.ar',
      activa: true,
    },
  });
  console.log('✅ Planta creada:', plantaCentro.nombre);

  const plantaNorte = await prisma.plantas.upsert({
    where: { codigoHabilitacion: 'PLT-NORTE' },
    update: {},
    create: {
      camaraId: camara.id,
      municipioId: municipioCapital.id,
      nombre: 'VTV Salta Norte',
      cuit: '30-98765432-2',
      direccion: 'Ruta 51 Km 3.5, Salta Capital',
      codigoHabilitacion: 'PLT-NORTE',
      telefono: '387-4222222',
      email: 'info@vtvsalta.com.ar',
      activa: true,
    },
  });
  console.log('✅ Planta creada:', plantaNorte.nombre);

  const plantaOran = await prisma.plantas.upsert({
    where: { codigoHabilitacion: 'PLT-ORAN' },
    update: {},
    create: {
      camaraId: camara.id,
      municipioId: municipioCerrillos.id,
      nombre: 'VTV Orán',
      cuit: '30-98765432-3',
      direccion: 'Av. San Martín 456, San Ramón de la Nueva Orán',
      codigoHabilitacion: 'PLT-ORAN',
      telefono: '387-4333333',
      email: 'info@vtvoran.com.ar',
      activa: true,
    },
  });
  console.log('✅ Planta creada:', plantaOran.nombre);

  // 4. Crear Tipos de Vehículo
  const tiposVehiculo = [
    { nombre: 'Automóvil', descripcion: 'Vehículo particular de hasta 9 pasajeros' },
    { nombre: 'Motocicleta', descripcion: 'Vehículo de 2 o 3 ruedas' },
    { nombre: 'Camioneta', descripcion: 'Pick-up o utilitario' },
    { nombre: 'Camión', descripcion: 'Vehículo de carga pesada' },
    { nombre: 'Colectivo', descripcion: 'Transporte público de pasajeros' },
  ];

  for (const tipo of tiposVehiculo) {
    await prisma.tipos_vehiculo.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    });
  }
  console.log('✅ Tipos de vehículo creados:', tiposVehiculo.length);

  // 5. Crear Usuarios
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Usuario CAMARA (superadmin)
  const userCamara = await prisma.users.upsert({
    where: { email: 'admin@camarasalta.gob.ar' },
    update: {},
    create: {
      username: 'admin_camara',
      email: 'admin@camarasalta.gob.ar',
      password: hashedPassword,
      role: 'CAMARA',
      camaraId: camara.id,
      activo: true,
    },
  });
  console.log('✅ Usuario CAMARA creado:', userCamara.email);

  // Usuarios VTV Salta Centro
  const adminCentro = await prisma.users.upsert({
    where: { email: 'admin.salta.centro@vtvsalta.com.ar' },
    update: {},
    create: {
      username: 'admin_centro',
      email: 'admin.salta.centro@vtvsalta.com.ar',
      password: hashedPassword,
      role: 'PLANTA_ADMIN',
      plantaId: plantaCentro.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_ADMIN creado:', adminCentro.email);

  const operadorCentro = await prisma.users.upsert({
    where: { email: 'operador.salta.centro@vtvsalta.com.ar' },
    update: {},
    create: {
      username: 'operador_centro',
      email: 'operador.salta.centro@vtvsalta.com.ar',
      password: hashedPassword,
      role: 'PLANTA_OPERADOR',
      plantaId: plantaCentro.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_OPERADOR creado:', operadorCentro.email);

  // Usuarios VTV Salta Norte
  const adminNorte = await prisma.users.upsert({
    where: { email: 'admin.salta.norte@vtvsalta.com.ar' },
    update: {},
    create: {
      username: 'admin_norte',
      email: 'admin.salta.norte@vtvsalta.com.ar',
      password: hashedPassword,
      role: 'PLANTA_ADMIN',
      plantaId: plantaNorte.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_ADMIN creado:', adminNorte.email);

  const operadorNorte = await prisma.users.upsert({
  console.log('\n✨ Seed completado exitosamente!\n');
  console.log('📋 CREDENCIALES DE DEMO:');
  console.log('========================');
  console.log('🔐 Contraseña para todos: Password123!\n');
  console.log('👤 CAMARA (Superadmin):');
  console.log('   Email: admin@camarasalta.gob.ar\n');
  console.log('👤 VTV SALTA CENTRO:');
  console.log('   Admin: admin.salta.centro@vtvsalta.com.ar');
  console.log('   Operador: operador.salta.centro@vtvsalta.com.ar\n');
  console.log('👤 VTV SALTA NORTE:');
  console.log('   Admin: admin.salta.norte@vtvsalta.com.ar');
  console.log('   Operador: operador.salta.norte@vtvsalta.com.ar\n');
  console.log('👤 VTV ORÁN:');
  console.log('   Admin: admin.salta.oran@vtvoran.com.ar');
  console.log('   Operador: operador.salta.oran@vtvoran.com.ar\n');
  console.log('👤 MUNICIPIO:');
  console.log('   Email: fiscal@saltacapital.gob.ar\n');r' },
    update: {},
    create: {
      username: 'admin_oran',
      email: 'admin.salta.oran@vtvoran.com.ar',
      password: hashedPassword,
      role: 'PLANTA_ADMIN',
      plantaId: plantaOran.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_ADMIN creado:', adminOran.email);

  const operadorOran = await prisma.users.upsert({
    where: { email: 'operador.salta.oran@vtvoran.com.ar' },
    update: {},
    create: {
      username: 'operador_oran',
      email: 'operador.salta.oran@vtvoran.com.ar',
      password: hashedPassword,
      role: 'PLANTA_OPERADOR',
      plantaId: plantaOran.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_OPERADOR creado:', operadorOran.email);

  // Usuario MUNICIPIO
  const userMunicipio = await prisma.users.upsert({
    where: { email: 'fiscal@saltacapital.gob.ar' },
    update: {},
    create: {
      username: 'admin_municipio',
      email: 'fiscal@saltacapital.gob.ar',
      password: hashedPassword,
      role: 'MUNICIPIO',
      municipioId: municipioCapital.id,
      activo: true,
    },
  });
  console.log('✅ Usuario MUNICIPIO creado:', userMunicipio.email);

  console.log('\n✨ Seed completado exitosamente!\n');
  console.log('📋 CREDENCIALES DE DEMO:');
  console.log('========================');
  console.log('🔐 Contraseña para todos: Password123!\n');
  console.log('👤 CAMARA (Superadmin):');
  console.log('   Email: admin@camarasalta.gob.ar');
  console.log('   Rol: Administrador de la Cámara\n');
  console.log('👤 PLANTA_ADMIN:');
  console.log('   Email: admin.salta.centro@vtvsalta.com.ar');
  console.log('   Rol: Administrador de Planta\n');
  console.log('👤 PLANTA_OPERADOR:');
  console.log('   Email: operador.salta.centro@vtvsalta.com.ar');
  console.log('   Rol: Operador de Planta\n');
  console.log('👤 MUNICIPIO:');
  console.log('   Email: fiscal@saltacapital.gob.ar');
  console.log('   Rol: Administrador Municipal\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
