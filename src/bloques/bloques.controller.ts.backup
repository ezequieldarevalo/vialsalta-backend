import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { BloquesService } from './bloques.service';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { UpdateBloqueDto } from './dto/update-bloque.dto';
import { AsignarBloqueDto } from './dto/asignar-bloque.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';

/**
 * Controlador de Bloques de Obleas
 * Solo accesible para usuarios con rol CAMARA
 */
@Controller('bloques')
@Roles(UserRole.CAMARA) // Solo la cámara puede gestionar bloques
export class BloquesController {
  constructor(private readonly bloquesService: BloquesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBloqueDto: CreateBloqueDto, @Request() req) {
    return this.bloquesService.create(createBloqueDto, req.user.camaraId);
  }

  @Get()
  findAll(@Request() req) {
    return this.bloquesService.findAll(req.user.camaraId);
  }

  @Get('estadisticas')
  getEstadisticas(@Request() req) {
    return this.bloquesService.getEstadisticas(req.user.camaraId);
  }

  @Get('planta/:plantaId')
  findByPlanta(
    @Param('plantaId', ParseIntPipe) plantaId: number,
    @Request() req,
  ) {
    return this.bloquesService.findByPlanta(plantaId, req.user.camaraId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bloquesService.findOne(id, req.user.camaraId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBloqueDto: UpdateBloqueDto,
    @Request() req,
  ) {
    return this.bloquesService.update(id, updateBloqueDto, req.user.camaraId);
  }

  @Post(':id/asignar')
  @HttpCode(HttpStatus.OK)
  asignarPlanta(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarBloqueDto: AsignarBloqueDto,
    @Request() req,
  ) {
    return this.bloquesService.asignarPlanta(
      id,
      asignarBloqueDto.plantaId,
      req.user.camaraId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bloquesService.remove(id, req.user.camaraId);
  }
}
