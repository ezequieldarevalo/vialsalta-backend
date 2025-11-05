import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MunicipiosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Métodos básicos de ejemplo
  async findAll() {
    const cacheKey = 'municipios:all';

    // Intentar obtener del cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no está en cache, consultar DB
    const municipios = await this.prisma.municipios.findMany();

    // Guardar en cache por 10 minutos (raramente cambian)
    await this.cacheManager.set(cacheKey, municipios, 600000);

    return municipios;
  }

  async findOne(id: number) {
    const cacheKey = `municipio:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const municipio = await this.prisma.municipios.findUnique({
      where: { id },
    });

    if (municipio) {
      await this.cacheManager.set(cacheKey, municipio, 600000);
    }

    return municipio;
  }

  async create(data: {
    camaraId: number;
    nombre: string;
    codigo: string;
    porcentajeReparto?: number;
    activo?: boolean;
  }) {
    const municipio = await this.prisma.municipios.create({ data });

    // Invalidar cache de lista completa
    await this.cacheManager.del('municipios:all');

    return municipio;
  }

  async update(
    id: number,
    data: {
      nombre?: string;
      codigo?: string;
      porcentajeReparto?: number;
      activo?: boolean;
    },
  ) {
    const municipio = await this.prisma.municipios.update({
      where: { id },
      data,
    });

    // Invalidar cache del item y de la lista
    await this.cacheManager.del(`municipio:${id}`);
    await this.cacheManager.del('municipios:all');

    return municipio;
  }

  async remove(id: number): Promise<void> {
    await this.prisma.municipios.delete({ where: { id } });

    // Invalidar cache
    await this.cacheManager.del(`municipio:${id}`);
    await this.cacheManager.del('municipios:all');
  }
}
