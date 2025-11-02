import { Min, IsOptional, IsInt, Max } from 'class-validator';

export class CreateBloqueDto {
  @IsInt()
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Max(1000, { message: 'La cantidad máxima es 1000 obleas' })
  cantidad: number;

  @IsOptional()
  @IsInt()
  plantaId?: number;
}
