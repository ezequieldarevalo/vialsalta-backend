import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { ResultadoRevision } from '../common/enums';
import {
  RevisionesMesDto,
  ObleasStatsDto,
  TasaAprobacionDto,
  VehiculosPorTipoDto,
  VehiculoProximoVencerDto,
  EstadisticasResponseDto,
  MesAprobacionDto,
} from './dto/estadisticas-response.dto';

/**
 * Servicio para generar estadísticas de planta
 * Migrado a Prisma ORM
 */
@Injectable()
export class EstadisticasService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtener todas las estadísticas de una planta
   */
  async getEstadisticas(plantaId: number): Promise<EstadisticasResponseDto> {
    const cacheKey = `estadisticas:planta:${plantaId}`;
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return cached;
    }

    const [
      revisionesMes,
      obleas,
      tasaAprobacion,
      vehiculosPorTipo,
      proximosVencimientos,
    ] = await Promise.all([
      this.getRevisionesMes(plantaId),
      this.getObleasStats(plantaId),
      this.getTasaAprobacion(plantaId),
      this.getVehiculosPorTipo(plantaId),
      this.getProximosVencimientos(plantaId),
    ]);

    const estadisticas = {
      revisionesMes,
      obleas,
      tasaAprobacion,
      vehiculosPorTipo,
      proximosVencimientos,
    };

    // Cache por 5 minutos (se recalcula frecuentemente)
    await this.cacheManager.set(cacheKey, estadisticas, 300000);

    return estadisticas;
  }

  /**
   * Obtener revisiones del mes actual
   */
  private async getRevisionesMes(plantaId: number): Promise<RevisionesMesDto> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const revisiones = await this.prisma.revisiones.findMany({
      where: {
        plantaId,
        fechaRevision: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    });

    const total = revisiones.length;
    const aprobadas = revisiones.filter(
      (r) => r.resultado === ResultadoRevision.APROBADO,
    ).length;
    const rechazadas = revisiones.filter(
      (r) => r.resultado === ResultadoRevision.RECHAZADO,
    ).length;
    const condicionales = revisiones.filter(
      (r) => r.resultado === ResultadoRevision.CONDICIONAL,
    ).length;

    return {
      total,
      aprobadas,
      rechazadas,
      condicionales,
      porcentajeAprobadas:
        total > 0 ? Math.round((aprobadas / total) * 10000) / 100 : 0,
      porcentajeRechazadas:
        total > 0 ? Math.round((rechazadas / total) * 10000) / 100 : 0,
      porcentajeCondicionales:
        total > 0 ? Math.round((condicionales / total) * 10000) / 100 : 0,
    };
  }

  /**
   * Obtener estadísticas de obleas
   */
  private async getObleasStats(plantaId: number): Promise<ObleasStatsDto> {
    // Obtener todos los bloques asignados a esta planta
    const bloques = await this.prisma.bloques_obleas.findMany({
      where: { plantaId },
    });

    if (bloques.length === 0) {
      return {
        utilizadasMes: 0,
        disponibles: 0,
        alertaBajoStock: true,
        umbralAlerta: 20,
      };
    }

    // Calcular total de obleas en todos los bloques
    const total = bloques.reduce(
      (sum, bloque) => sum + (bloque.numeroFin - bloque.numeroInicio + 1),
      0,
    );

    // Contar obleas utilizadas en el mes actual
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const bloqueIds = bloques.map((b) => b.id);

    const utilizadasMes = await this.prisma.revisiones.count({
      where: {
        obleas: {
          bloqueId: { in: bloqueIds },
        },
        fechaRevision: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    });

    // Contar obleas totalmente utilizadas
    const utilizadasTotal = await this.prisma.revisiones.count({
      where: {
        obleas: {
          bloqueId: { in: bloqueIds },
        },
      },
    });

    const disponibles = total - utilizadasTotal;
    const alertaBajoStock = disponibles < total * 0.2; // Alerta si quedan menos del 20%

    return {
      utilizadasMes,
      disponibles,
      alertaBajoStock,
      umbralAlerta: 20,
    };
  }

  /**
   * Calcular tasa de aprobación con tendencia de 6 meses
   */
  private async getTasaAprobacion(
    plantaId: number,
  ): Promise<TasaAprobacionDto> {
    const now = new Date();
    const ultimos6Meses: MesAprobacionDto[] = [];

    // Calcular para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const inicioMes = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const finMes = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      const revisiones = await this.prisma.revisiones.findMany({
        where: {
          plantaId,
          fechaRevision: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      const total = revisiones.length;
      const aprobadas = revisiones.filter(
        (r) => r.resultado === (ResultadoRevision.APROBADO as any),
      ).length;
      const porcentaje = total > 0 ? (aprobadas / total) * 100 : 0;

      const mesNombre = inicioMes.toLocaleDateString('es-ES', {
        month: 'short',
      });

      ultimos6Meses.push({
        mes: mesNombre,
        anio: inicioMes.getFullYear(),
        total,
        porcentaje: Math.round(porcentaje * 100) / 100,
      });
    }

    // Calcular tasa actual y anterior
    const actual =
      ultimos6Meses.length > 0 ? ultimos6Meses[ultimos6Meses.length - 1] : null;
    const anterior =
      ultimos6Meses.length > 1 ? ultimos6Meses[ultimos6Meses.length - 2] : null;

    const mesActual = actual?.porcentaje || 0;
    const mesAnterior = anterior?.porcentaje || 0;
    const diferencia = Math.round((mesActual - mesAnterior) * 100) / 100;

    let tendencia: 'subida' | 'bajada' | 'estable' = 'estable';
    if (diferencia > 2) tendencia = 'subida';
    if (diferencia < -2) tendencia = 'bajada';

    return {
      mesActual,
      mesAnterior,
      diferencia,
      tendencia,
      ultimos6Meses,
    };
  }

  /**
   * Obtener distribución de vehículos por tipo
   */
  private async getVehiculosPorTipo(
    plantaId: number,
  ): Promise<VehiculosPorTipoDto[]> {
    const revisiones = await this.prisma.revisiones.findMany({
      where: { plantaId },
      include: {
        vehiculos: {
          include: {
            tipos_vehiculo: true,
          },
        },
      },
    });

    // Usar Map para evitar duplicados de vehículos
    const vehiculosUnicos = new Map<number, any>();
    revisiones.forEach((revision) => {
      if (revision.vehiculos) {
        vehiculosUnicos.set(revision.vehiculos.id, revision.vehiculos);
      }
    });

    // Contar por tipo
    const countPorTipo = new Map<string, number>();
    vehiculosUnicos.forEach((vehiculo) => {
      const tipo =
        vehiculo.tipos_vehiculo?.nombre || vehiculo.tipo || 'Sin tipo';
      countPorTipo.set(tipo, (countPorTipo.get(tipo) || 0) + 1);
    });

    const total = vehiculosUnicos.size;

    return Array.from(countPorTipo.entries()).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje: total > 0 ? Math.round((cantidad / total) * 10000) / 100 : 0,
    }));
  }

  /**
   * Obtener vehículos que vencen en los próximos 30-60 días
   */
  private async getProximosVencimientos(
    plantaId: number,
  ): Promise<VehiculoProximoVencerDto[]> {
    const now = new Date();
    const en30Dias = new Date(now);
    en30Dias.setDate(en30Dias.getDate() + 30);
    const en60Dias = new Date(now);
    en60Dias.setDate(en60Dias.getDate() + 60);

    // Buscar revisiones aprobadas que vencen en los próximos 30-60 días
    const revisiones = await this.prisma.revisiones.findMany({
      where: {
        plantaId,
        resultado: ResultadoRevision.APROBADO as any,
        fechaVencimiento: {
          gte: en30Dias,
          lte: en60Dias,
        },
      },
      include: {
        vehiculos: {
          include: {
            tipos_vehiculo: true,
          },
        },
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    });

    const result: VehiculoProximoVencerDto[] = [];
    const vehiculosAgregados = new Set<number>();

    for (const revision of revisiones) {
      // Saltear si no tiene vehículo, ya está agregado, o no tiene fecha de vencimiento
      if (
        !revision.vehiculos ||
        vehiculosAgregados.has(revision.vehiculos.id) ||
        !revision.fechaVencimiento
      ) {
        continue;
      }

      const diasRestantes = Math.ceil(
        (new Date(revision.fechaVencimiento).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      result.push({
        id: revision.vehiculos.id,
        dominio: revision.vehiculos.dominio,
        marca: revision.vehiculos.marca,
        modelo: revision.vehiculos.modelo,
        tipoVehiculo:
          revision.vehiculos.tipos_vehiculo?.nombre ||
          revision.vehiculos.tipo ||
          undefined,
        fechaVencimiento: revision.fechaVencimiento,
        diasRestantes,
      });

      vehiculosAgregados.add(revision.vehiculos.id);
    }

    return result;
  }
}
