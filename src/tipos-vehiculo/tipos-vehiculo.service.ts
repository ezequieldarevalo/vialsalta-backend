import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';

@Injectable()
export class TiposVehiculoService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createDto: CreateTipoVehiculoDto) {
    // Verificar si ya existe un tipo con ese nombre
    const existe = await this.prisma.tipos_vehiculo.findUnique({
      where: { nombre: createDto.nombre },
    });

    if (existe) {
      throw new BadRequestException(
        `Ya existe un tipo de vehículo con el nombre "${createDto.nombre}"`,
      );
    }

    const tipo = await this.prisma.tipos_vehiculo.create({
      data: createDto,
    });

    // Invalidar cache
    await this.cacheManager.del('tipos_vehiculo:all');
    await this.cacheManager.del('tipos_vehiculo:activos');

    return tipo;
  }

  async findAll(activosOnly = false) {
    const cacheKey = activosOnly
      ? 'tipos_vehiculo:activos'
      : 'tipos_vehiculo:all';

    // Intentar obtener del cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no está en cache, consultar DB
    const tipos = await this.prisma.tipos_vehiculo.findMany({
      where: activosOnly ? { activo: true } : {},
    });

    // Guardar en cache por 15 minutos (datos casi estáticos)
    await this.cacheManager.set(cacheKey, tipos, 900000);

    return tipos;
  }

  async findOne(id: number) {
    const cacheKey = `tipo_vehiculo:${id}`;

    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cached;
    }

    const tipo = await this.prisma.tipos_vehiculo.findUnique({
      where: { id },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de vehículo con ID ${id} no encontrado`,
      );
    }

    await this.cacheManager.set(cacheKey, tipo, 900000);

    return tipo;
  }

  async update(id: number, updateDto: UpdateTipoVehiculoDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tipo: any = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (updateDto.nombre && updateDto.nombre !== tipo.nombre) {
      const existe = await this.prisma.tipos_vehiculo.findUnique({
        where: { nombre: updateDto.nombre },
      });

      if (existe) {
        throw new BadRequestException(
          `Ya existe un tipo de vehículo con el nombre "${updateDto.nombre}"`,
        );
      }
    }

    const updated = await this.prisma.tipos_vehiculo.update({
      where: { id },
      data: updateDto,
    });

    // Invalidar cache
    await this.cacheManager.del(`tipo_vehiculo:${id}`);
    await this.cacheManager.del('tipos_vehiculo:all');
    await this.cacheManager.del('tipos_vehiculo:activos');

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    // En lugar de eliminar físicamente, desactivar
    await this.prisma.tipos_vehiculo.update({
      where: { id },
      data: { activo: false },
    });

    // Invalidar cache
    await this.cacheManager.del(`tipo_vehiculo:${id}`);
    await this.cacheManager.del('tipos_vehiculo:all');
    await this.cacheManager.del('tipos_vehiculo:activos');
  }
}
