import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator para definir qué roles tienen acceso a un endpoint
 *
 * @example
 * @Roles(UserRole.CAMARA)
 * @Get('bloques')
 * async getBloques() { ... }
 *
 * @example
 * @Roles(UserRole.CAMARA, UserRole.PLANTA)
 * @Get('obleas')
 * async getObleas() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
