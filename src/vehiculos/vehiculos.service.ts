import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

/**
 * Servicio de gestión de vehículos
 */
@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private vehiculosRepository: Repository<Vehiculo>,
  ) {}

  /**
   * Crear un nuevo vehículo
   */
  async create(createVehiculoDto: CreateVehiculoDto): Promise<Vehiculo> {
    const { dominio } = createVehiculoDto;

    // Verificar que el dominio no existe
    const existe = await this.vehiculosRepository.findOne({
      where: { dominio: dominio.toUpperCase() },
    });
    if (existe) {
      throw new BadRequestException(
        `Ya existe un vehículo con dominio ${dominio}`,
      );
    }

    const vehiculo = this.vehiculosRepository.create({
      ...createVehiculoDto,
      dominio: dominio.toUpperCase(),
    });

    return this.vehiculosRepository.save(vehiculo);
  }

  /**
   * Listar todos los vehículos
   */
  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculosRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Listar vehículos disponibles para nueva revisión
   * (sin revisión vigente o con revisión vencida)
   */
  async findDisponiblesParaRevision(): Promise<Vehiculo[]> {
    const hoy = new Date();

    // Obtener todos los vehículos con sus revisiones
    const vehiculos = await this.vehiculosRepository
      .createQueryBuilder('vehiculo')
      .leftJoinAndSelect('vehiculo.revisiones', 'revision')
      .orderBy('vehiculo.createdAt', 'DESC')
      .getMany();

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
  async findByDominio(dominio: string): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { dominio: dominio.toUpperCase() },
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
  async findOne(id: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepository.findOne({ where: { id } });

    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }

    return vehiculo;
  }

  /**
   * Actualizar un vehículo
   */
  async update(
    id: number,
    updateVehiculoDto: UpdateVehiculoDto,
  ): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    // Si se actualiza el dominio, verificar que no exista
    if (
      updateVehiculoDto.dominio &&
      updateVehiculoDto.dominio !== vehiculo.dominio
    ) {
      const existe = await this.vehiculosRepository.findOne({
        where: { dominio: updateVehiculoDto.dominio.toUpperCase() },
      });
      if (existe) {
        throw new BadRequestException(
          `Ya existe un vehículo con dominio ${updateVehiculoDto.dominio}`,
        );
      }
      updateVehiculoDto.dominio = updateVehiculoDto.dominio.toUpperCase();
    }

    Object.assign(vehiculo, updateVehiculoDto);
    return this.vehiculosRepository.save(vehiculo);
  }

  /**
   * Eliminar un vehículo
   */
  async remove(id: number): Promise<void> {
    const vehiculo = await this.findOne(id);
    await this.vehiculosRepository.remove(vehiculo);
  }
}
