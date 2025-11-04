import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVehiculo } from './entities/tipo-vehiculo.entity';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';

@Injectable()
export class TiposVehiculoService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private readonly tipoVehiculoRepository: Repository<TipoVehiculo>,
  ) {}

  async create(createDto: CreateTipoVehiculoDto): Promise<TipoVehiculo> {
    // Verificar si ya existe un tipo con ese nombre
    const existe = await this.tipoVehiculoRepository.findOne({
      where: { nombre: createDto.nombre },
    });

    if (existe) {
      throw new BadRequestException(`Ya existe un tipo de vehículo con el nombre "${createDto.nombre}"`);
    }

    const tipo = this.tipoVehiculoRepository.create(createDto);
    return await this.tipoVehiculoRepository.save(tipo);
  }

  async findAll(activosOnly = false): Promise<TipoVehiculo[]> {
    const where = activosOnly ? { activo: true } : {};
    return await this.tipoVehiculoRepository.find({ where });
  }

  async findOne(id: number): Promise<TipoVehiculo> {
    const tipo = await this.tipoVehiculoRepository.findOne({ where: { id } });
    
    if (!tipo) {
      throw new NotFoundException(`Tipo de vehículo con ID ${id} no encontrado`);
    }

    return tipo;
  }

  async update(id: number, updateDto: UpdateTipoVehiculoDto): Promise<TipoVehiculo> {
    const tipo = await this.findOne(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (updateDto.nombre && updateDto.nombre !== tipo.nombre) {
      const existe = await this.tipoVehiculoRepository.findOne({
        where: { nombre: updateDto.nombre },
      });

      if (existe) {
        throw new BadRequestException(`Ya existe un tipo de vehículo con el nombre "${updateDto.nombre}"`);
      }
    }

    Object.assign(tipo, updateDto);
    return await this.tipoVehiculoRepository.save(tipo);
  }

  async remove(id: number): Promise<void> {
    const tipo = await this.findOne(id);
    
    // En lugar de eliminar físicamente, desactivar
    tipo.activo = false;
    await this.tipoVehiculoRepository.save(tipo);
  }
}
