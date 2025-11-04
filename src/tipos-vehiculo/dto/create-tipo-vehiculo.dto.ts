import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTipoVehiculoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
