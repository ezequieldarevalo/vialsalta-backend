import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Controlador de prueba para demostrar el sistema de permisos
 * Este controlador se puede eliminar después de las pruebas
 */
@Controller('demo')
export class DemoController {
  @Get('public-info')
  getPublicInfo() {
    return {
      message: 'Esta información es pública (solo requiere autenticación)',
    };
  }

  @Roles(UserRole.CAMARA)
  @Get('camara-only')
  getCamaraOnly() {
    return {
      message: 'Solo usuarios con rol CAMARA pueden ver esto',
      data: 'Información exclusiva de cámara',
    };
  }

  @Roles(UserRole.PLANTA_ADMIN, UserRole.PLANTA_OPERADOR)
  @Get('planta-only')
  getPlantaOnly() {
    return {
      message:
        'Solo usuarios con rol PLANTA_ADMIN o PLANTA_OPERADOR pueden ver esto',
      data: 'Información exclusiva de planta',
    };
  }

  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.PLANTA_OPERADOR)
  @Get('camara-or-planta')
  getCamaraOrPlanta() {
    return {
      message:
        'Usuarios con rol CAMARA, PLANTA_ADMIN o PLANTA_OPERADOR pueden ver esto',
      data: 'Información compartida',
    };
  }

  @Roles(UserRole.MUNICIPIO)
  @Get('municipio-only')
  getMunicipioOnly() {
    return {
      message: 'Solo usuarios con rol MUNICIPIO pueden ver esto',
      data: 'Información exclusiva de municipio',
    };
  }
}
