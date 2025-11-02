import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiculo.dto';

/**
 * DTO para actualizar un vehículo
 */
export class UpdateVehiculoDto extends PartialType(CreateVehiculoDto) {}
