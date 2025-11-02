import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { RevisionesService } from './revisiones.service';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { UpdateRevisionDto } from './dto/update-revision.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums';

/**
 * Controlador de Revisiones Técnicas
 */
@Controller('revisiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RevisionesController {
  constructor(private readonly revisionesService: RevisionesService) {}

  /**
   * Crear una nueva revisión técnica
   * Solo usuarios PLANTA y MUNICIPIO pueden crear revisiones
   */
  @Post()
  @Roles(UserRole.CAMARA, UserRole.PLANTA_OPERADOR, UserRole.MUNICIPIO)
  create(@Body() createRevisionDto: CreateRevisionDto, @Req() req: any) {
    return this.revisionesService.create(createRevisionDto, req.user);
  }

  /**
   * Asignar oblea a una revisión aprobada
   * Solo usuarios CAMARA y PLANTA
   */
  @Post(':id/asignar-oblea')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN)
  asignarOblea(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.revisionesService.asignarOblea(id, req.user);
  }

  /**
   * Obtener estadísticas de revisiones
   */
  @Get('estadisticas')
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  getEstadisticas(@Req() req: any) {
    return this.revisionesService.getEstadisticas(req.user);
  }

  /**
   * Listar todas las revisiones
   */
  @Get()
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  findAll(@Req() req: any) {
    return this.revisionesService.findAll(req.user);
  }

  /**
   * Obtener una revisión por ID
   */
  @Get(':id')
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.revisionesService.findOne(id, req.user);
  }

  /**
   * Actualizar una revisión
   * Solo si no tiene oblea asignada
   */
  @Patch(':id')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_OPERADOR, UserRole.MUNICIPIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRevisionDto: UpdateRevisionDto,
    @Req() req: any,
  ) {
    return this.revisionesService.update(id, updateRevisionDto, req.user);
  }

  /**
   * Eliminar una revisión
   * Solo si no tiene oblea asignada
   */
  @Delete(':id')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.revisionesService.remove(id, req.user);
  }
}
