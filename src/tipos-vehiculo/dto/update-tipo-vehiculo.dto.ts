import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoVehiculoDto } from './create-tipo-vehiculo.dto';

export class UpdateTipoVehiculoDto extends PartialType(CreateTipoVehiculoDto) {}
