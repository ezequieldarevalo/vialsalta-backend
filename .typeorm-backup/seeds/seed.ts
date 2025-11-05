import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Camara } from '../../camaras/entities/camara.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';
import { Planta } from '../../plantas/entities/planta.entity';
import { User } from '../../users/user.entity';
import { BloqueObleas } from '../../bloques/entities/bloque-obleas.entity';
import { Oblea } from '../../obleas/entities/oblea.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { EstadoBloque, EstadoOblea } from '../../common/enums';

/**
 * Script de seed para poblar la base de datos con datos de prueba
 *
 * Ejecutar: npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 */

async function runSeed() {
  // Conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'obleas_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false, // No sincronizar, solo insertar datos
  });

  await dataSource.initialize();
  console.log('✅ Conexión a base de datos establecida');

  try {
    // ============================================
    // 1. Crear Cámaras de diferentes provincias
    // ============================================
    const camaraRepo = dataSource.getRepository(Camara);

    // Cámara de Salta
    let camaraSalta = await camaraRepo.findOne({
      where: { cuit: '30-12345678-9' },
    });
    if (!camaraSalta) {
      camaraSalta = camaraRepo.create({
        nombre: 'Cámara de Talleres de Revisión Técnica Vehicular de Salta',
        provincia: 'Salta',
        codigo: 'SAL',
        rangoInicio: 1000000,
        rangoFin: 1999999,
        cuit: '30-12345678-9',
        direccion: 'Av. Belgrano 123, Salta Capital',
        telefono: '+54 387 4321000',
        email: 'contacto@camarasalta.gob.ar',
        activa: true,
      });
      await camaraRepo.save(camaraSalta);
      console.log('✅ Cámara creada:', camaraSalta.nombre);
    } else {
      console.log('ℹ️  Cámara ya existe:', camaraSalta.nombre);
    }

    // Cámara de Córdoba
    let camaraCordoba = await camaraRepo.findOne({
      where: { cuit: '30-98765432-1' },
    });
    if (!camaraCordoba) {
      camaraCordoba = camaraRepo.create({
        nombre: 'Cámara de Talleres de Revisión Técnica de Córdoba',
        provincia: 'Córdoba',
        codigo: 'CBA',
        rangoInicio: 2000000,
        rangoFin: 2999999,
        cuit: '30-98765432-1',
        direccion: 'Av. Colón 456, Córdoba Capital',
        telefono: '+54 351 4567890',
        email: 'info@camaracordoba.org.ar',
        activa: true,
      });
      await camaraRepo.save(camaraCordoba);
      console.log('✅ Cámara creada:', camaraCordoba.nombre);
    } else {
      console.log('ℹ️  Cámara ya existe:', camaraCordoba.nombre);
    }

    // Cámara de Tucumán
    let camaraTucuman = await camaraRepo.findOne({
      where: { cuit: '30-11223344-5' },
    });
    if (!camaraTucuman) {
      camaraTucuman = camaraRepo.create({
        nombre: 'Cámara de Plantas de VTV de Tucumán',
        provincia: 'Tucumán',
        codigo: 'TUC',
        rangoInicio: 3000000,
        rangoFin: 3999999,
        cuit: '30-11223344-5',
        direccion: 'Av. Mate de Luna 789, San Miguel de Tucumán',
        telefono: '+54 381 4123456',
        email: 'contacto@camaratucuman.gob.ar',
        activa: true,
      });
      await camaraRepo.save(camaraTucuman);
      console.log('✅ Cámara creada:', camaraTucuman.nombre);
    } else {
      console.log('ℹ️  Cámara ya existe:', camaraTucuman.nombre);
    }

    // ============================================
    // 2. Crear Municipios por provincia
    // ============================================
    const municipioRepo = dataSource.getRepository(Municipio);

    // Municipios de Salta
    const municipiosSaltaData = [
      { nombre: 'Salta Capital', codigo: 'SAL-001', porcentajeReparto: 35.0 },
      { nombre: 'Orán', codigo: 'SAL-002', porcentajeReparto: 15.0 },
      { nombre: 'Tartagal', codigo: 'SAL-003', porcentajeReparto: 12.0 },
      { nombre: 'Metán', codigo: 'SAL-004', porcentajeReparto: 10.0 },
      { nombre: 'Cafayate', codigo: 'SAL-005', porcentajeReparto: 8.0 },
    ];

    const municipiosSalta: Municipio[] = [];
    for (const data of municipiosSaltaData) {
      let municipio = await municipioRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!municipio) {
        municipio = municipioRepo.create({
          ...data,
          camara: camaraSalta,
          activo: true,
        });
        await municipioRepo.save(municipio);
        console.log(`✅ Municipio creado: ${municipio.nombre} (Salta)`);
      } else {
        console.log(`ℹ️  Municipio ya existe: ${municipio.nombre}`);
      }
      municipiosSalta.push(municipio);
    }

    // Municipios de Córdoba
    const municipiosCordobaData = [
      {
        nombre: 'Córdoba Capital',
        codigo: 'CBA-001',
        porcentajeReparto: 40.0,
      },
      { nombre: 'Villa María', codigo: 'CBA-002', porcentajeReparto: 15.0 },
      { nombre: 'Río Cuarto', codigo: 'CBA-003', porcentajeReparto: 15.0 },
    ];

    const municipiosCordoba: Municipio[] = [];
    for (const data of municipiosCordobaData) {
      let municipio = await municipioRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!municipio) {
        municipio = municipioRepo.create({
          ...data,
          camara: camaraCordoba,
          activo: true,
        });
        await municipioRepo.save(municipio);
        console.log(`✅ Municipio creado: ${municipio.nombre} (Córdoba)`);
      } else {
        console.log(`ℹ️  Municipio ya existe: ${municipio.nombre}`);
      }
      municipiosCordoba.push(municipio);
    }

    // Municipios de Tucumán
    const municipiosTucumanData = [
      {
        nombre: 'San Miguel de Tucumán',
        codigo: 'TUC-001',
        porcentajeReparto: 50.0,
      },
      { nombre: 'Yerba Buena', codigo: 'TUC-002', porcentajeReparto: 20.0 },
    ];

    const municipiosTucuman: Municipio[] = [];
    for (const data of municipiosTucumanData) {
      let municipio = await municipioRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!municipio) {
        municipio = municipioRepo.create({
          ...data,
          camara: camaraTucuman,
          activo: true,
        });
        await municipioRepo.save(municipio);
        console.log(`✅ Municipio creado: ${municipio.nombre} (Tucumán)`);
      } else {
        console.log(`ℹ️  Municipio ya existe: ${municipio.nombre}`);
      }
      municipiosTucuman.push(municipio);
    }

    // ============================================
    // 3. Crear Plantas Verificadoras por provincia
    // ============================================
    const plantaRepo = dataSource.getRepository(Planta);

    // Plantas de Salta
    const plantasSaltaData = [
      {
        nombre: 'VTV Salta Centro',
        direccion: 'Ruta 51 Km 3.5, Salta Capital',
        codigoHabilitacion: 'VTV-SAL-001',
        telefono: '+54 387 4567890',
        email: 'centro@vtvsalta.com.ar',
        municipio: municipiosSalta[0], // Salta Capital
      },
      {
        nombre: 'VTV Salta Norte',
        direccion: 'Av. Tavella 2500, Salta Capital',
        codigoHabilitacion: 'VTV-SAL-002',
        telefono: '+54 387 4567891',
        email: 'norte@vtvsalta.com.ar',
        municipio: municipiosSalta[0], // Salta Capital
      },
      {
        nombre: 'VTV Orán',
        direccion: 'Ruta 34 Km 1490, San Ramón de la Nueva Orán',
        codigoHabilitacion: 'VTV-ORA-001',
        telefono: '+54 3878 421000',
        email: 'contacto@vtvoran.com.ar',
        municipio: municipiosSalta[1], // Orán
      },
    ];

    const plantasSalta: Planta[] = [];
    for (const data of plantasSaltaData) {
      let planta = await plantaRepo.findOne({
        where: { codigoHabilitacion: data.codigoHabilitacion },
      });

      if (!planta) {
        planta = plantaRepo.create({
          ...data,
          camara: camaraSalta,
          activa: true,
        });
        await plantaRepo.save(planta);
        console.log(`✅ Planta creada: ${planta.nombre} (Salta)`);
      } else {
        console.log(`ℹ️  Planta ya existe: ${planta.nombre}`);
      }
      plantasSalta.push(planta);
    }

    // Plantas de Córdoba
    const plantasCordobaData = [
      {
        nombre: 'RTO Córdoba Centro',
        direccion: 'Av. Circunvalación Km 10, Córdoba',
        codigoHabilitacion: 'RTO-CBA-001',
        telefono: '+54 351 4567890',
        email: 'centro@rtocordoba.com.ar',
        municipio: municipiosCordoba[0], // Córdoba Capital
      },
      {
        nombre: 'RTO Villa María',
        direccion: 'Ruta 9 Km 558, Villa María',
        codigoHabilitacion: 'RTO-CBA-002',
        telefono: '+54 353 4561234',
        email: 'info@rtovmaria.com.ar',
        municipio: municipiosCordoba[1], // Villa María
      },
    ];

    const plantasCordoba: Planta[] = [];
    for (const data of plantasCordobaData) {
      let planta = await plantaRepo.findOne({
        where: { codigoHabilitacion: data.codigoHabilitacion },
      });

      if (!planta) {
        planta = plantaRepo.create({
          ...data,
          camara: camaraCordoba,
          activa: true,
        });
        await plantaRepo.save(planta);
        console.log(`✅ Planta creada: ${planta.nombre} (Córdoba)`);
      } else {
        console.log(`ℹ️  Planta ya existe: ${planta.nombre}`);
      }
      plantasCordoba.push(planta);
    }

    // Plantas de Tucumán
    const plantasTucumanData = [
      {
        nombre: 'VTV Tucumán Centro',
        direccion: 'Av. Juan B. Justo 2345, San Miguel de Tucumán',
        codigoHabilitacion: 'VTV-TUC-001',
        telefono: '+54 381 4123456',
        email: 'contacto@vtvtucuman.com.ar',
        municipio: municipiosTucuman[0], // SMT
      },
    ];

    const plantasTucuman: Planta[] = [];
    for (const data of plantasTucumanData) {
      let planta = await plantaRepo.findOne({
        where: { codigoHabilitacion: data.codigoHabilitacion },
      });

      if (!planta) {
        planta = plantaRepo.create({
          ...data,
          camara: camaraTucuman,
          activa: true,
        });
        await plantaRepo.save(planta);
        console.log(`✅ Planta creada: ${planta.nombre} (Tucumán)`);
      } else {
        console.log(`ℹ️  Planta ya existe: ${planta.nombre}`);
      }
      plantasTucuman.push(planta);
    }

    // ============================================
    // 4. Crear Usuarios de cada rol por provincia
    // ============================================
    const userRepo = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Usuarios de prueba: admin y operador por planta, admin cámara y fiscal municipio
    const usersData = [
      // Salta - Cámara
      {
        username: 'admin.salta',
        email: 'admin@camarasalta.gob.ar',
        password: hashedPassword,
        role: UserRole.CAMARA,
        camara: camaraSalta,
      },
      // Salta - Plantas
      {
        username: 'admin.salta.centro',
        email: 'admin.salta.centro@vtvsalta.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasSalta[0],
      },
      {
        username: 'operador.salta.centro',
        email: 'operador.salta.centro@vtvsalta.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasSalta[0],
      },
      {
        username: 'admin.salta.norte',
        email: 'admin.salta.norte@vtvsalta.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasSalta[1],
      },
      {
        username: 'operador.salta.norte',
        email: 'operador.salta.norte@vtvsalta.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasSalta[1],
      },
      {
        username: 'admin.salta.oran',
        email: 'admin.salta.oran@vtvoran.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasSalta[2],
      },
      {
        username: 'operador.salta.oran',
        email: 'operador.salta.oran@vtvoran.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasSalta[2],
      },
      // Salta - Municipio
      {
        username: 'fiscal.salta',
        email: 'fiscal@saltacapital.gob.ar',
        password: hashedPassword,
        role: UserRole.MUNICIPIO,
        municipio: municipiosSalta[0],
      },
      // Córdoba - Cámara
      {
        username: 'admin.cordoba',
        email: 'admin@camaracordoba.org.ar',
        password: hashedPassword,
        role: UserRole.CAMARA,
        camara: camaraCordoba,
      },
      // Córdoba - Plantas
      {
        username: 'admin.cordoba.centro',
        email: 'admin.cordoba.centro@rtocordoba.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasCordoba[0],
      },
      {
        username: 'operador.cordoba.centro',
        email: 'operador.cordoba.centro@rtocordoba.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasCordoba[0],
      },
      {
        username: 'admin.cordoba.villamaria',
        email: 'admin.cordoba.villamaria@rtovmaria.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasCordoba[1],
      },
      {
        username: 'operador.cordoba.villamaria',
        email: 'operador.cordoba.villamaria@rtovmaria.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasCordoba[1],
      },
      // Córdoba - Municipio
      {
        username: 'fiscal.cordoba',
        email: 'fiscal@cordobacapital.gob.ar',
        password: hashedPassword,
        role: UserRole.MUNICIPIO,
        municipio: municipiosCordoba[0],
      },
      // Tucumán - Cámara
      {
        username: 'admin.tucuman',
        email: 'admin@camaratucuman.gob.ar',
        password: hashedPassword,
        role: UserRole.CAMARA,
        camara: camaraTucuman,
      },
      // Tucumán - Planta
      {
        username: 'admin.tucuman.centro',
        email: 'admin.tucuman.centro@vtvtucuman.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_ADMIN,
        planta: plantasTucuman[0],
      },
      {
        username: 'operador.tucuman.centro',
        email: 'operador.tucuman.centro@vtvtucuman.com.ar',
        password: hashedPassword,
        role: UserRole.PLANTA_OPERADOR,
        planta: plantasTucuman[0],
      },
      // Tucumán - Municipio
      {
        username: 'fiscal.tucuman',
        email: 'fiscal@smtucuman.gob.ar',
        password: hashedPassword,
        role: UserRole.MUNICIPIO,
        municipio: municipiosTucuman[0],
      },
    ];

    for (const data of usersData) {
      let user = await userRepo.findOne({ where: { email: data.email } });

      if (!user) {
        user = new User();
        Object.assign(user, data);
        await userRepo.save(user);
        console.log(`✅ Usuario creado: ${user.username} (${user.role})`);
      } else {
        console.log(`ℹ️  Usuario ya existe: ${user.username}`);
      }
    }

    // ============================================
    // 5. Crear Bloques de Obleas por provincia
    // Rangos numéricos:
    // - Salta: 1000000 - 1999999
    // - Córdoba: 2000000 - 2999999
    // - Tucumán: 3000000 - 3999999
    // ============================================
    const bloqueRepo = dataSource.getRepository(BloqueObleas);

    // Bloques de Salta
    const bloquesSaltaData = [
      {
        codigo: 'BLQ-SAL-2025-001',
        numeroInicio: 1000000,
        numeroFin: 1000099,
        cantidadTotal: 100,
        estado: EstadoBloque.ASIGNADO,
        camara: camaraSalta,
        planta: plantasSalta[0], // VTV Salta Centro
        fechaAsignacion: new Date('2025-01-15'),
      },
      {
        codigo: 'BLQ-SAL-2025-002',
        numeroInicio: 1000100,
        numeroFin: 1000199,
        cantidadTotal: 100,
        estado: EstadoBloque.ASIGNADO,
        camara: camaraSalta,
        planta: plantasSalta[1], // VTV Salta Norte
        fechaAsignacion: new Date('2025-01-15'),
      },
      {
        codigo: 'BLQ-SAL-2025-003',
        numeroInicio: 1000200,
        numeroFin: 1000299,
        cantidadTotal: 100,
        estado: EstadoBloque.CREADO,
        camara: camaraSalta,
      },
    ];

    for (const data of bloquesSaltaData) {
      let bloque = await bloqueRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!bloque) {
        bloque = new BloqueObleas();
        Object.assign(bloque, data);
        await bloqueRepo.save(bloque);
        console.log(
          `✅ Bloque creado: ${bloque.codigo} (${bloque.numeroInicio}-${bloque.numeroFin}, ${bloque.estado}) - Salta`,
        );
      } else {
        console.log(`ℹ️  Bloque ya existe: ${bloque.codigo}`);
      }
    }

    // Bloques de Córdoba
    const bloquesCordobaData = [
      {
        codigo: 'BLQ-CBA-2025-001',
        numeroInicio: 2000000,
        numeroFin: 2000099,
        cantidadTotal: 100,
        estado: EstadoBloque.ASIGNADO,
        camara: camaraCordoba,
        planta: plantasCordoba[0], // RTO Córdoba Centro
        fechaAsignacion: new Date('2025-01-10'),
      },
      {
        codigo: 'BLQ-CBA-2025-002',
        numeroInicio: 2000100,
        numeroFin: 2000199,
        cantidadTotal: 100,
        estado: EstadoBloque.CREADO,
        camara: camaraCordoba,
      },
    ];

    for (const data of bloquesCordobaData) {
      let bloque = await bloqueRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!bloque) {
        bloque = new BloqueObleas();
        Object.assign(bloque, data);
        await bloqueRepo.save(bloque);
        console.log(
          `✅ Bloque creado: ${bloque.codigo} (${bloque.numeroInicio}-${bloque.numeroFin}, ${bloque.estado}) - Córdoba`,
        );
      } else {
        console.log(`ℹ️  Bloque ya existe: ${bloque.codigo}`);
      }
    }

    // Bloques de Tucumán
    const bloquesTucumanData = [
      {
        codigo: 'BLQ-TUC-2025-001',
        numeroInicio: 3000000,
        numeroFin: 3000099,
        cantidadTotal: 100,
        estado: EstadoBloque.ASIGNADO,
        camara: camaraTucuman,
        planta: plantasTucuman[0], // VTV Tucumán Centro
        fechaAsignacion: new Date('2025-01-12'),
      },
    ];

    for (const data of bloquesTucumanData) {
      let bloque = await bloqueRepo.findOne({
        where: { codigo: data.codigo },
      });

      if (!bloque) {
        bloque = new BloqueObleas();
        Object.assign(bloque, data);
        await bloqueRepo.save(bloque);
        console.log(
          `✅ Bloque creado: ${bloque.codigo} (${bloque.numeroInicio}-${bloque.numeroFin}, ${bloque.estado}) - Tucumán`,
        );
      } else {
        console.log(`ℹ️  Bloque ya existe: ${bloque.codigo}`);
      }
    }

    // ============================================
    // 6. Crear obleas de ejemplo (primeras 10 de cada bloque asignado)
    // ============================================
    const oleaRepo = dataSource.getRepository(Oblea);
    const bloquesAsignados = await bloqueRepo.find({
      where: { estado: EstadoBloque.ASIGNADO },
      relations: ['planta', 'camara'],
    });

    for (const bloque of bloquesAsignados) {
      const baseNumber = bloque.numeroInicio;

      for (let i = 0; i < 10; i++) {
        const numero = baseNumber + i;

        let oblea = await oleaRepo.findOne({ where: { numero } });

        if (!oblea) {
          oblea = new Oblea();
          oblea.numero = numero;
          oblea.codigoQr = `QR-${numero}-${Date.now()}-${i}`;
          oblea.estado = EstadoOblea.DISPONIBLE;
          oblea.bloque = bloque;
          oblea.camaraId = bloque.camaraId; // ← AGREGADO: ID de la cámara
          oblea.planta = bloque.planta;
          await oleaRepo.save(oblea);
        }
      }
      console.log(
        `✅ Obleas creadas para bloque: ${bloque.codigo} (10 unidades)`,
      );
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(
      '\n📋 Credenciales de prueba (todas con password: Password123!):',
    );
    console.log('\n🔹 SALTA:');
    console.log('   - admin@camarasalta.gob.ar (ROL: CAMARA)');
    console.log('   - operador@vtvsalta.com.ar (ROL: PLANTA - VTV Centro)');
    console.log('   - fiscal@saltacapital.gob.ar (ROL: MUNICIPIO)');
    console.log('\n🔹 CÓRDOBA:');
    console.log('   - admin@camaracordoba.org.ar (ROL: CAMARA)');
    console.log('   - operador@rtocordoba.com.ar (ROL: PLANTA - RTO Centro)');
    console.log('   - fiscal@cordobacapital.gob.ar (ROL: MUNICIPIO)');
    console.log('\n🔹 TUCUMÁN:');
    console.log('   - admin@camaratucuman.gob.ar (ROL: CAMARA)');
    console.log('   - operador@vtvtucuman.com.ar (ROL: PLANTA - VTV Centro)');
    console.log('   - fiscal@smtucuman.gob.ar (ROL: MUNICIPIO)');
    console.log('\n📊 Datos creados:');
    console.log('   - 3 Provincias (Salta, Córdoba, Tucumán)');
    console.log('   - 3 Cámaras (una por provincia)');
    console.log('   - 10 Municipios (5 Salta, 3 Córdoba, 2 Tucumán)');
    console.log('   - 6 Plantas VTV (3 Salta, 2 Córdoba, 1 Tucumán)');
    console.log('   - 6 Bloques de obleas (rangos exclusivos por provincia)');
    console.log('   - 9 Usuarios (3 por provincia)');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');
  }
}

// Ejecutar seed
runSeed()
  .then(() => {
    console.log('✅ Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
