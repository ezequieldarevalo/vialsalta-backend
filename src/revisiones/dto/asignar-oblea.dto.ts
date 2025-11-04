import { IsInt, Min } from 'class-validator';

/**
 * DTO para asignar una oblea a una revisión aprobada
 * Ahora incluye el número de oblea escaneada/ingresada
 */
export class AsignarObleaDto {
  @IsInt()
  @Min(1)
  numeroOblea: number;
}
