import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  Length,
  Min,
  Max,
} from 'class-validator';
import { TipoVehiculo, TipoCombustible } from '../../common/enums';

/**
 * DTO para crear un vehículo
 */
export class CreateVehiculoDto {
  @IsString()
  @Length(6, 10)
  dominio: string;

  @IsString()
  @Length(1, 100)
  marca: string;

  @IsString()
  @Length(1, 100)
  modelo: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @IsEnum(TipoVehiculo)
  tipo: TipoVehiculo;

  @IsEnum(TipoCombustible)
  combustible: TipoCombustible;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  numeroMotor?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  numeroChasis?: string;
}
