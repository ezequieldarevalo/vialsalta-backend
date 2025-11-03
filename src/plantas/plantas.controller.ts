import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { PlantasService } from './plantas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('plantas')
@UseGuards(JwtAuthGuard)
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Get()
  findAll(@Request() req) {
    if (req.user.camaraId) {
      return this.plantasService.findByCamara(req.user.camaraId);
    }
    return this.plantasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantasService.findOne(id);
  }

  @Post()
  @Roles(UserRole.CAMARA)
  create(@Body() dto: any) {
    return this.plantasService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.CAMARA)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.plantasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.CAMARA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantasService.remove(id);
  }
}
