import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PlantasService } from './plantas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plantas')
@UseGuards(JwtAuthGuard)
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Get()
  findAll(@Request() req) {
    // Si el usuario tiene camaraId, filtrar por esa cámara
    if (req.user.camaraId) {
      return this.plantasService.findByCamara(req.user.camaraId);
    }
    // Si no, devolver todas
    return this.plantasService.findAll();
  }
}
