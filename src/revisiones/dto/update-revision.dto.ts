import { PartialType } from '@nestjs/mapped-types';
import { CreateRevisionDto } from './create-revision.dto';

/**
 * DTO para actualizar una revisión técnica
 */
export class UpdateRevisionDto extends PartialType(CreateRevisionDto) {}
