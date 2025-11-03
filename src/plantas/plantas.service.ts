import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planta } from './entities/planta.entity';

@Injectable()
export class PlantasService {
  async update(id: number, data: Partial<Planta>): Promise<Planta> {
    await this.plantasRepository.update(id, data);
    const updated = await this.findOne(id);
    if (!updated) throw new Error('Planta no encontrada');
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.plantasRepository.delete(id);
  }
  constructor(
    @InjectRepository(Planta)
    private plantasRepository: Repository<Planta>,
  ) {}

  async create(data: {
    nombre: string;
    cuit: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    camaraId: number;
  }): Promise<Planta> {
    const planta = this.plantasRepository.create(data);
    return this.plantasRepository.save(planta);
  }

  async findOne(id: number): Promise<Planta | null> {
    return this.plantasRepository.findOne({
      where: { id },
      relations: ['camara'],
    });
  }

  async findByCamara(camaraId: number): Promise<Planta[]> {
    return this.plantasRepository.find({
      where: { camaraId },
      relations: ['camara'],
    });
  }

  async findAll(): Promise<Planta[]> {
    return this.plantasRepository.find({
      relations: ['camara'],
    });
  }
}
