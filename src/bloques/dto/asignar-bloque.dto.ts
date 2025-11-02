import { IsInt } from 'class-validator';

export class AsignarBloqueDto {
  @IsInt()
  plantaId: number;
}
