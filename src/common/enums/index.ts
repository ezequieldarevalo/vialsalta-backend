export { UserRole } from './user-role.enum';

/**
 * Estados de una oblea oficial
 */
export enum EstadoOblea {
  DISPONIBLE = 'DISPONIBLE',
  ASIGNADA = 'ASIGNADA',
  EMITIDA = 'EMITIDA',
  ANULADA = 'ANULADA',
}

/**
 * Estados de un bloque de obleas
 */
export enum EstadoBloque {
  CREADO = 'CREADO',
  ASIGNADO = 'ASIGNADO',
  EN_USO = 'EN_USO',
  AGOTADO = 'AGOTADO',
  ANULADO = 'ANULADO',
}

/**
 * Resultado de una revisión técnica
 */
export enum ResultadoRevision {
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  CONDICIONAL = 'CONDICIONAL',
}

/**
 * Tipos de vehículo
 */
export enum TipoVehiculo {
  AUTOMOVIL = 'AUTOMOVIL',
  CAMIONETA = 'CAMIONETA',
  CAMION = 'CAMION',
  MOTO = 'MOTO',
  COLECTIVO = 'COLECTIVO',
  OTRO = 'OTRO',
}

/**
 * Tipos de combustible
 */
export enum TipoCombustible {
  NAFTA = 'NAFTA',
  DIESEL = 'DIESEL',
  GNC = 'GNC',
  ELECTRICO = 'ELECTRICO',
  HIBRIDO = 'HIBRIDO',
}
