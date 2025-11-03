import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDecimal,
} from 'class-validator';

export class CreateMunicipioDto {
  @IsNumber()
  camaraId: number;

  @IsString()
  nombre: string;

  @IsString()
  codigo: string;

  @IsDecimal()
  porcentajeReparto: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateMunicipioDto {
  @IsNumber()
  @IsOptional()
  camaraId?: number;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsDecimal()
  @IsOptional()
  porcentajeReparto?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
