import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { CreateBloqueDto } from './create-bloque.dto';
import { EstadoBloque } from '../../common/enums';

export class UpdateBloqueDto extends PartialType(CreateBloqueDto) {
  @IsOptional()
  @IsInt()
  plantaId?: number;

  @IsOptional()
  @IsEnum(EstadoBloque)
  estado?: EstadoBloque;
}
