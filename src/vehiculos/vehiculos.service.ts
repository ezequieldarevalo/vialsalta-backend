import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

/**
 * Servicio de gestión de vehículos
 */
@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo vehículo
   */
  async create(createVehiculoDto: CreateVehiculoDto) {
    const { dominio, fechaPrimeraMatriculacion } = createVehiculoDto;

    // Verificar que el dominio no existe
    const existe = await this.prisma.vehiculos.findUnique({
      where: { dominio: dominio.toUpperCase() },
    });
    if (existe) {
      throw new BadRequestException(
        `Ya existe un vehículo con dominio ${dominio}`,
      );
    }

    // Calcular el año automáticamente desde la fecha de matriculación o usar el proporcionado
    let anio = createVehiculoDto.anio;

    if (!anio && fechaPrimeraMatriculacion) {
      const fecha = new Date(fechaPrimeraMatriculacion);
      anio = fecha.getFullYear();
    }

    if (!anio) {
      throw new BadRequestException(
        'Debe proporcionar el año del vehículo o la fecha de primera matriculación',
      );
    }

    return this.prisma.vehiculos.create({
      data: {
        ...createVehiculoDto,
        dominio: dominio.toUpperCase(),
        anio,
      },
    });
  }

  /**
   * Listar todos los vehículos
   */
  async findAll() {
    return this.prisma.vehiculos.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listar vehículos disponibles para nueva revisión
   * (sin revisión vigente o con revisión vencida)
   */
  async findDisponiblesParaRevision() {
    const hoy = new Date();

    // Obtener todos los vehículos con sus revisiones
    const vehiculos = await this.prisma.vehiculos.findMany({
      include: { revisiones: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filtrar vehículos que NO tienen revisión vigente
    return vehiculos.filter((vehiculo) => {
      if (!vehiculo.revisiones || vehiculo.revisiones.length === 0) {
        return true; // Sin revisiones, disponible
      }

      // Buscar si tiene alguna revisión APROBADA y vigente
      const tieneRevisionVigente = vehiculo.revisiones.some((revision) => {
        if (revision.resultado !== 'APROBADO') return false;
        if (!revision.fechaVencimiento) return false;

        const vencimiento = new Date(revision.fechaVencimiento);
        return vencimiento > hoy; // Vigente si no venció
      });

      return !tieneRevisionVigente; // Disponible si NO tiene revisión vigente
    });
  }

  /**
   * Buscar vehículo por dominio
   */
  async findByDominio(dominio: string) {
    const vehiculo = await this.prisma.vehiculos.findUnique({
      where: { dominio: dominio.toUpperCase() },
      include: { revisiones: true },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con dominio ${dominio} no encontrado`,
      );
    }

    return vehiculo;
  }

  /**
   * Obtener un vehículo por ID
   */
  async findOne(id: number) {
    const vehiculo = await this.prisma.vehiculos.findUnique({
      where: { id },
      include: { revisiones: true },
    });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehiculo;
  }

  /**
   * Actualizar un vehículo
   */
  async update(id: number, updateVehiculoDto: UpdateVehiculoDto) {
    const vehiculo = await this.findOne(id);

    // Si se cambia el dominio, verificar que no exista otro vehículo con ese dominio
    if (
      updateVehiculoDto.dominio &&
      updateVehiculoDto.dominio.toUpperCase() !== vehiculo.dominio
    ) {
      const existe = await this.prisma.vehiculos.findUnique({
        where: { dominio: updateVehiculoDto.dominio.toUpperCase() },
      });
      if (existe) {
        throw new BadRequestException(
          `Ya existe un vehículo con dominio ${updateVehiculoDto.dominio}`,
        );
      }
      updateVehiculoDto.dominio = updateVehiculoDto.dominio.toUpperCase();
    }

    // Si se actualiza la fecha de matriculación sin proporcionar año, recalcular
    if (
      updateVehiculoDto.fechaPrimeraMatriculacion &&
      !updateVehiculoDto.anio
    ) {
      const fecha = new Date(updateVehiculoDto.fechaPrimeraMatriculacion);
      updateVehiculoDto.anio = fecha.getFullYear();
    }

    return this.prisma.vehiculos.update({
      where: { id },
      data: updateVehiculoDto,
    });
  }

  /**
   * Eliminar un vehículo
   */
  async remove(id: number): Promise<void> {
    const vehiculo = await this.findOne(id);

    // Verificar que no tenga revisiones
    if (vehiculo.revisiones && vehiculo.revisiones.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un vehículo que tiene revisiones registradas',
      );
    }

    await this.prisma.vehiculos.delete({ where: { id } });
  }
}
