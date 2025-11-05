import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MunicipiosService } from './municipios.service';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly municipiosService: MunicipiosService) {}

  @Get()
  findAll() {
    return this.municipiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.municipiosService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    data: {
      camaraId: number;
      nombre: string;
      codigo: string;
      porcentajeReparto?: number;
      activo?: boolean;
    },
  ) {
    return this.municipiosService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body()
    data: {
      nombre?: string;
      codigo?: string;
      porcentajeReparto?: number;
      activo?: boolean;
    },
  ) {
    return this.municipiosService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.municipiosService.remove(Number(id));
  }
}
