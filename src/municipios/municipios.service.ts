import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';

@Injectable()
export class MunicipiosService {
	constructor(
		@InjectRepository(Municipio)
		private readonly repo: Repository<Municipio>,
	) {}

	// Métodos básicos de ejemplo
	async findAll(): Promise<Municipio[]> {
		return this.repo.find();
	}

	async findOne(id: number): Promise<Municipio | null> {
		return this.repo.findOne({ where: { id } });
	}

	async create(data: Partial<Municipio>): Promise<Municipio> {
		const municipio = this.repo.create(data);
		return this.repo.save(municipio);
	}

			async update(
				id: number,
				data: Partial<Municipio>,
			): Promise<Municipio | null> {
				await this.repo.update(id, data);
				return this.findOne(id);
			}

			async remove(id: number): Promise<void> {
				await this.repo.delete(id);
			}
}
