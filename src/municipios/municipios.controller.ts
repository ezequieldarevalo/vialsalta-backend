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
import { Municipio } from './entities/municipio.entity';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly municipiosService: MunicipiosService) {}

  @Get()
  findAll(): Promise<Municipio[]> {
    return this.municipiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Municipio | null> {
    return this.municipiosService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: Partial<Municipio>): Promise<Municipio> {
    return this.municipiosService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: Partial<Municipio>,
  ): Promise<Municipio | null> {
    return this.municipiosService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.municipiosService.remove(Number(id));
  }
}
