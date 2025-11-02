import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums';

/**
 * Controlador de Vehículos
 */
@Controller('vehiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  /**
   * Crear un nuevo vehículo
   */
  @Post()
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  /**
   * Listar todos los vehículos
   */
  @Get()
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  findAll(@Query('disponibles') disponibles?: string) {
    // Si viene ?disponibles=true, devolver solo disponibles para revisión
    if (disponibles === 'true') {
      return this.vehiculosService.findDisponiblesParaRevision();
    }
    return this.vehiculosService.findAll();
  }

  /**
   * Buscar vehículo por dominio (query param)
   */
  @Get('buscar')
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  findByDominio(@Query('dominio') dominio: string) {
    return this.vehiculosService.findByDominio(dominio);
  }

  /**
   * Obtener un vehículo por ID
   */
  @Get(':id')
  @Roles(
    UserRole.CAMARA,
    UserRole.PLANTA_ADMIN,
    UserRole.PLANTA_OPERADOR,
    UserRole.MUNICIPIO,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.findOne(id);
  }

  /**
   * Actualizar un vehículo
   */
  @Patch(':id')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.PLANTA_OPERADOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
  ) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  /**
   * Eliminar un vehículo
   */
  @Delete(':id')
  @Roles(UserRole.CAMARA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.remove(id);
  }
}
