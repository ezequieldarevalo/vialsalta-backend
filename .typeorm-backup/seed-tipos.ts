import { DataSource } from 'typeorm';
import { TipoVehiculo } from './entities/tipo-vehiculo.entity';

export async function seedTiposVehiculo(dataSource: DataSource) {
  const tipoVehiculoRepo = dataSource.getRepository(TipoVehiculo);

  const tiposIniciales = [
    {
      nombre: 'AUTOMOVIL',
      descripcion: 'Vehículo de pasajeros estándar',
      activo: true,
    },
    {
      nombre: 'CAMIONETA',
      descripcion: 'Vehículo utilitario de carga ligera',
      activo: true,
    },
    {
      nombre: 'CAMION',
      descripcion: 'Vehículo de carga pesada',
      activo: true,
    },
    {
      nombre: 'MOTO',
      descripcion: 'Motocicleta o ciclomotor',
      activo: true,
    },
    {
      nombre: 'COLECTIVO',
      descripcion: 'Vehículo de transporte público de pasajeros',
      activo: true,
    },
    {
      nombre: 'OTRO',
      descripcion: 'Otros tipos de vehículos no clasificados',
      activo: true,
    },
  ];

  for (const tipoData of tiposIniciales) {
    const existe = await tipoVehiculoRepo.findOne({
      where: { nombre: tipoData.nombre },
    });

    if (!existe) {
      const tipo = tipoVehiculoRepo.create(tipoData);
      await tipoVehiculoRepo.save(tipo);
      console.log(`✅ Tipo creado: ${tipoData.nombre}`);
    } else {
      console.log(`⏭️  Tipo ya existe: ${tipoData.nombre}`);
    }
  }
}
