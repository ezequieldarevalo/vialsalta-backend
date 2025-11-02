import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar endpoints como públicos (sin autenticación)
 *
 * @example
 * @Public()
 * @Get('certificado/:codigo')
 * async getCertificadoPublico(@Param('codigo') codigo: string) { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
