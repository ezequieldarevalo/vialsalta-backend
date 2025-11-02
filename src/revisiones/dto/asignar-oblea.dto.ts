import { IsInt } from 'class-validator';

/**
 * DTO para asignar una oblea a una revisión aprobada
 */
export class AsignarObleaDto {
  @IsInt()
  revisionId: number;
}
