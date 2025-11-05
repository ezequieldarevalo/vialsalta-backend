import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlantasService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(data: {
    nombre: string;
    cuit?: string;
    codigoHabilitacion: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    camaraId: number;
    municipioId: number;
  }) {
    const planta = await this.prisma.plantas.create({ data });
    await this.cacheManager.del('plantas:all');
    await this.cacheManager.del(`plantas:camara:${data.camaraId}`);
    return planta;
  }

  async findOne(id: number) {
    const cacheKey = `planta:${id}`;
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cached;
    }

    const planta = await this.prisma.plantas.findUnique({
      where: { id },
      include: { camaras: true, municipios: true },
    });

    if (planta) {
      await this.cacheManager.set(cacheKey, planta, 600000); // 10 min
    }
    return planta;
  }

  async findByCamara(camaraId: number) {
    const cacheKey = `plantas:camara:${camaraId}`;
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cached;
    }

    const plantas = await this.prisma.plantas.findMany({
      where: { camaraId },
      include: { camaras: true, municipios: true },
    });

    await this.cacheManager.set(cacheKey, plantas, 600000);
    return plantas;
  }

  async findAll() {
    const cacheKey = 'plantas:all';
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cached;
    }

    const plantas = await this.prisma.plantas.findMany({
      include: { camaras: true, municipios: true },
    });

    await this.cacheManager.set(cacheKey, plantas, 600000);
    return plantas;
  }

  async update(
    id: number,
    data: {
      nombre?: string;
      cuit?: string;
      direccion?: string;
      telefono?: string;
      email?: string;
      activa?: boolean;
    },
  ) {
    const planta = await this.prisma.plantas.update({
      where: { id },
      data,
    });

    // Invalidar caches
    await this.cacheManager.del(`planta:${id}`);
    await this.cacheManager.del('plantas:all');

    // Obtener camaraId para invalidar cache específico
    const plantaData = await this.prisma.plantas.findUnique({
      where: { id },
      select: { camaraId: true },
    });
    if (plantaData) {
      await this.cacheManager.del(`plantas:camara:${plantaData.camaraId}`);
    }

    return planta;
  }

  async remove(id: number): Promise<void> {
    const planta = await this.prisma.plantas.findUnique({
      where: { id },
      select: { camaraId: true },
    });

    await this.prisma.plantas.delete({ where: { id } });

    // Invalidar caches
    await this.cacheManager.del(`planta:${id}`);
    await this.cacheManager.del('plantas:all');
    if (planta) {
      await this.cacheManager.del(`plantas:camara:${planta.camaraId}`);
    }
  }
}
