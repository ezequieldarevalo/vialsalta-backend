import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasResponseDto } from './dto/estadisticas-response.dto';

/**
 * Controlador de Estadísticas
 * Endpoints para obtener métricas y estadísticas de la planta
 */
@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  /**
   * GET /estadisticas
   * Obtener todas las estadísticas de la planta del usuario autenticado
   * Solo PLANTA_ADMIN puede acceder
   */
  @Get()
  @Roles(UserRole.PLANTA_ADMIN)
  async getEstadisticas(@Request() req): Promise<EstadisticasResponseDto> {
    const plantaId = req.user.plantaId;
    return this.estadisticasService.getEstadisticas(plantaId);
  }
}
