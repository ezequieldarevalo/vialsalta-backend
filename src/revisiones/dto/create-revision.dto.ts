import {
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ResultadoRevision } from '../../common/enums';

/**
 * DTO para crear una revisión técnica
 */
export class CreateRevisionDto {
  @IsInt()
  vehiculoId: number;

  @IsOptional()
  @IsInt()
  plantaId?: number; // Si no se envía, se usa la planta del usuario

  @IsEnum(ResultadoRevision)
  resultado: ResultadoRevision;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  urlFoto?: string;

  @IsOptional()
  @IsNumber()
  kilometraje?: number;

  @IsOptional()
  @IsDateString()
  fechaRevision?: string;
}
