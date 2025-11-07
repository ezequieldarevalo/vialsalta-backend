import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear Cámara
  const camara = await prisma.camaras.upsert({
    where: { codigo: 'CAM-SALTA-001' },
    update: {},
    create: {
      nombre: 'Cámara de Talleres de Salta',
      provincia: 'Salta',
      codigo: 'CAM-SALTA-001',
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
    where: { codigo: 'MUN-CAPITAL' },
    update: {},
    create: {
      camaraId: camara.id,
      nombre: 'Municipalidad de Salta',
      codigo: 'MUN-CAPITAL',
      porcentajeReparto: 40.0,
      activo: true,
    },
  });
  console.log('✅ Municipio creado:', municipioCapital.nombre);

  const municipioCerrillos = await prisma.municipios.upsert({
    where: { codigo: 'MUN-CERRILLOS' },
    update: {},
    create: {
      camaraId: camara.id,
      nombre: 'Municipalidad de Cerrillos',
      codigo: 'MUN-CERRILLOS',
      porcentajeReparto: 30.0,
      activo: true,
    },
  });
  console.log('✅ Municipio creado:', municipioCerrillos.nombre);

  // 3. Crear Planta
  const planta = await prisma.plantas.upsert({
    where: { codigoHabilitacion: 'PLT-001' },
    update: {},
    create: {
      camaraId: camara.id,
      municipioId: municipioCapital.id,
      nombre: 'RTV Salta Norte',
      cuit: '30-98765432-1',
      direccion: 'Ruta 51 Km 3.5, Salta Capital',
      codigoHabilitacion: 'PLT-001',
      telefono: '387-4567890',
      email: 'info@rtvsaltanorte.com.ar',
      activa: true,
    },
  });
  console.log('✅ Planta creada:', planta.nombre);

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
  const hashedPassword = await bcrypt.hash('Demo2024!', 10);

  // Usuario CAMARA (superadmin)
  const userCamara = await prisma.users.upsert({
    where: { email: 'admin@camarasalta.org.ar' },
    update: {},
    create: {
      username: 'admin_camara',
      email: 'admin@camarasalta.org.ar',
      password: hashedPassword,
      role: 'CAMARA',
      camaraId: camara.id,
      activo: true,
    },
  });
  console.log('✅ Usuario CAMARA creado:', userCamara.email);

  // Usuario PLANTA_ADMIN
  const userPlantaAdmin = await prisma.users.upsert({
    where: { email: 'admin@rtvsaltanorte.com.ar' },
    update: {},
    create: {
      username: 'admin_planta',
      email: 'admin@rtvsaltanorte.com.ar',
      password: hashedPassword,
      role: 'PLANTA_ADMIN',
      plantaId: planta.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_ADMIN creado:', userPlantaAdmin.email);

  // Usuario PLANTA_OPERADOR
  const userPlantaOperador = await prisma.users.upsert({
    where: { email: 'operador@rtvsaltanorte.com.ar' },
    update: {},
    create: {
      username: 'operador_planta',
      email: 'operador@rtvsaltanorte.com.ar',
      password: hashedPassword,
      role: 'PLANTA_OPERADOR',
      plantaId: planta.id,
      activo: true,
    },
  });
  console.log('✅ Usuario PLANTA_OPERADOR creado:', userPlantaOperador.email);

  // Usuario MUNICIPIO
  const userMunicipio = await prisma.users.upsert({
    where: { email: 'transito@municipalidadsalta.gob.ar' },
    update: {},
    create: {
      username: 'admin_municipio',
      email: 'transito@municipalidadsalta.gob.ar',
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
  console.log('🔐 Contraseña para todos: Demo2024!\n');
  console.log('👤 CAMARA (Superadmin):');
  console.log('   Email: admin@camarasalta.org.ar');
  console.log('   Rol: Administrador de la Cámara\n');
  console.log('👤 PLANTA_ADMIN:');
  console.log('   Email: admin@rtvsaltanorte.com.ar');
  console.log('   Rol: Administrador de Planta\n');
  console.log('👤 PLANTA_OPERADOR:');
  console.log('   Email: operador@rtvsaltanorte.com.ar');
  console.log('   Rol: Operador de Planta\n');
  console.log('👤 MUNICIPIO:');
  console.log('   Email: transito@municipalidadsalta.gob.ar');
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
