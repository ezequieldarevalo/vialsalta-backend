import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TiposVehiculoService } from './tipos-vehiculo.service';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('tipos-vehiculo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiposVehiculoController {
  constructor(private readonly tiposVehiculoService: TiposVehiculoService) {}

  @Post()
  @Roles(UserRole.CAMARA)
  create(@Body() createDto: CreateTipoVehiculoDto) {
    return this.tiposVehiculoService.create(createDto);
  }

  @Get()
  findAll(@Query('activos') activos?: string) {
    const activosOnly = activos === 'true';
    return this.tiposVehiculoService.findAll(activosOnly);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposVehiculoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.CAMARA)
  update(@Param('id') id: string, @Body() updateDto: UpdateTipoVehiculoDto) {
    return this.tiposVehiculoService.update(+id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.CAMARA)
  remove(@Param('id') id: string) {
    return this.tiposVehiculoService.remove(+id);
  }
}
