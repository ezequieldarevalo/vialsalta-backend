/**
 * DTOs para las respuestas de estadísticas
 */

/**
 * Estadísticas de revisiones del mes
 */
export class RevisionesMesDto {
  total: number;
  aprobadas: number;
  rechazadas: number;
  condicionales: number;
  porcentajeAprobadas: number;
  porcentajeRechazadas: number;
  porcentajeCondicionales: number;
}

/**
 * Estadísticas de obleas
 */
export class ObleasStatsDto {
  utilizadasMes: number;
  disponibles: number;
  alertaBajoStock: boolean;
  umbralAlerta: number;
}

/**
 * Tasa de aprobación con comparativa
 */
export class TasaAprobacionDto {
  mesActual: number;
  mesAnterior: number;
  diferencia: number;
  tendencia: 'subida' | 'bajada' | 'estable';
  ultimos6Meses: MesAprobacionDto[];
}

/**
 * Aprobación por mes
 */
export class MesAprobacionDto {
  mes: string;
  anio: number;
  porcentaje: number;
  total: number;
}

/**
 * Distribución de vehículos por tipo
 */
export class VehiculosPorTipoDto {
  tipo: string;
  cantidad: number;
  porcentaje: number;
}

/**
 * Vehículo próximo a vencer
 */
export class VehiculoProximoVencerDto {
  id: number;
  dominio: string;
  marca: string;
  modelo: string;
  tipoVehiculo?: string;
  fechaVencimiento: Date;
  diasRestantes: number;
}

/**
 * Respuesta completa de estadísticas
 */
export class EstadisticasResponseDto {
  revisionesMes: RevisionesMesDto;
  obleas: ObleasStatsDto;
  tasaAprobacion: TasaAprobacionDto;
  vehiculosPorTipo: VehiculosPorTipoDto[];
  proximosVencimientos: VehiculoProximoVencerDto[];
}
