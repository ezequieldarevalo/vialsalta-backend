import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloqueObleas } from './entities/bloque-obleas.entity';
import { Oblea } from '../obleas/entities/oblea.entity';
import { Planta } from '../plantas/entities/planta.entity';
import { Camara } from '../camaras/entities/camara.entity';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { UpdateBloqueDto } from './dto/update-bloque.dto';
import { EstadoBloque, EstadoOblea } from '../common/enums';

@Injectable()
export class BloquesService {
  constructor(
    @InjectRepository(BloqueObleas)
    private bloquesRepository: Repository<BloqueObleas>,
    @InjectRepository(Oblea)
    private obleasRepository: Repository<Oblea>,
    @InjectRepository(Planta)
    private plantasRepository: Repository<Planta>,
    @InjectRepository(Camara)
    private camarasRepository: Repository<Camara>,
  ) {}

  async create(
    createBloqueDto: CreateBloqueDto,
    camaraId: number,
  ): Promise<BloqueObleas> {
    const { cantidad, plantaId } = createBloqueDto;

    // Verificar que la cámara exista y obtener su código
    const camara = await this.camarasRepository.findOne({
      where: { id: camaraId },
    });
    if (!camara) {
      throw new NotFoundException(`Cámara con ID ${camaraId} no encontrada`);
    }

    // Obtener el último bloque de esta cámara para generar el código
    const lastBloque = await this.bloquesRepository.findOne({
      where: { camaraId },
      order: { createdAt: 'DESC' },
    });

    // Generar el código automáticamente
    let numeroConsecutivo = 1;
    if (lastBloque) {
      // Extraer el número del último código (ej: BLQ-SAL-2025-003 -> 3)
      const match = lastBloque.codigo.match(/-(\d+)$/);
      if (match) {
        numeroConsecutivo = parseInt(match[1]) + 1;
      }
    }

    const year = new Date().getFullYear();
    const codigo = `BLQ-${camara.codigo}-${year}-${numeroConsecutivo.toString().padStart(3, '0')}`;

    // Verificar que el código generado no exista (por seguridad)
    const existingBloque = await this.bloquesRepository.findOne({
      where: { codigo },
    });
    if (existingBloque) {
      throw new ConflictException(
        `Error al generar código de bloque. Contacte al administrador.`,
      );
    }

    // Calcular el rango de números automáticamente
    // Buscar el último número usado en esta cámara
    const lastBloqueWithNumbers = await this.bloquesRepository.findOne({
      where: { camaraId },
      order: { numeroFin: 'DESC' },
    });

    let numeroInicio: number;
    if (lastBloqueWithNumbers) {
      numeroInicio = lastBloqueWithNumbers.numeroFin + 1;
    } else {
      // Primera vez: usar el rango base de la cámara
      numeroInicio = camara.rangoInicio;
    }

    const numeroFin = numeroInicio + cantidad - 1;

    // Validar que no se exceda el rango de la cámara
    if (numeroFin > camara.rangoFin) {
      throw new BadRequestException(
        `No hay suficientes números disponibles. Rango disponible: ${camara.rangoInicio} - ${camara.rangoFin}. Último número usado: ${lastBloqueWithNumbers?.numeroFin || 'ninguno'}`,
      );
    }

    // Si se especifica plantaId, verificar que exista Y pertenezca a la misma cámara
    let planta: Planta | null = null;
    if (plantaId) {
      planta = await this.plantasRepository.findOne({
        where: { id: plantaId, camaraId },
      });
      if (!planta) {
        throw new NotFoundException(
          `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
        );
      }
    }

    // Crear el bloque
    const bloque = this.bloquesRepository.create({
      codigo,
      numeroInicio,
      numeroFin,
      cantidadTotal: cantidad,
      estado: plantaId ? EstadoBloque.ASIGNADO : EstadoBloque.CREADO,
      camara,
      planta: planta || undefined,
    });

    const savedBloque = await this.bloquesRepository.save(bloque);

    // Crear obleas automáticamente
    const obleas: Partial<Oblea>[] = [];
    for (let i = numeroInicio; i <= numeroFin; i++) {
      obleas.push({
        numero: i,
        estado: EstadoOblea.DISPONIBLE,
        camaraId: camaraId, // Asignar cámara a cada oblea
        bloque: savedBloque,
      });
    }

    await this.obleasRepository.save(obleas as Oblea[]);

    return this.findOne(savedBloque.id, camaraId);
  }

  async findAll(camaraId: number): Promise<BloqueObleas[]> {
    return this.bloquesRepository.find({
      where: { camaraId },
      relations: ['planta', 'obleas'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, camaraId: number): Promise<BloqueObleas> {
    const bloque = await this.bloquesRepository.findOne({
      where: { id, camaraId },
      relations: ['planta', 'planta.municipio', 'obleas'],
    });

    if (!bloque) {
      throw new NotFoundException(
        `Bloque con ID ${id} no encontrado o no pertenece a su cámara`,
      );
    }

    return bloque;
  }

  async findByPlanta(
    plantaId: number,
    camaraId: number,
  ): Promise<BloqueObleas[]> {
    // Verificar que la planta pertenezca a la cámara
    const planta = await this.plantasRepository.findOne({
      where: { id: plantaId, camaraId },
    });
    if (!planta) {
      throw new NotFoundException(
        `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
      );
    }

    return this.bloquesRepository.find({
      where: { planta: { id: plantaId }, camaraId },
      relations: ['planta', 'obleas'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateBloqueDto: UpdateBloqueDto,
    camaraId: number,
  ): Promise<BloqueObleas> {
    const bloque = await this.findOne(id, camaraId);

    // Solo permitir cambiar la planta asignada y el estado
    // No se pueden modificar rangos ni cantidades después de crear el bloque

    // Si se cambia la planta, verificar que pertenezca a la misma cámara
    if (updateBloqueDto.plantaId) {
      const planta = await this.plantasRepository.findOne({
        where: { id: updateBloqueDto.plantaId, camaraId },
      });
      if (!planta) {
        throw new NotFoundException(
          `Planta con ID ${updateBloqueDto.plantaId} no encontrada o no pertenece a su cámara`,
        );
      }
      bloque.planta = planta;
      bloque.estado = EstadoBloque.ASIGNADO;
    }

    if (updateBloqueDto.estado) {
      bloque.estado = updateBloqueDto.estado;
    }

    return this.bloquesRepository.save(bloque);
  }

  async asignarPlanta(
    id: number,
    plantaId: number,
    camaraId: number,
  ): Promise<BloqueObleas> {
    const bloque = await this.findOne(id, camaraId);

    // Verificar que el bloque esté en estado CREADO
    if (bloque.estado !== EstadoBloque.CREADO) {
      throw new BadRequestException(
        `El bloque debe estar en estado CREADO para ser asignado. Estado actual: ${bloque.estado}`,
      );
    }

    // Verificar que la planta exista y pertenezca a la misma cámara
    const planta = await this.plantasRepository.findOne({
      where: { id: plantaId, camaraId },
    });
    if (!planta) {
      throw new NotFoundException(
        `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
      );
    }

    // Asignar planta y cambiar estado
    bloque.planta = planta;
    bloque.estado = EstadoBloque.ASIGNADO;

    return this.bloquesRepository.save(bloque);
  }

  async remove(id: number, camaraId: number): Promise<void> {
    const bloque = await this.findOne(id, camaraId);

    // No permitir eliminar si tiene obleas asignadas
    const obleasAsignadas = await this.obleasRepository.count({
      where: {
        bloque: { id },
        estado: EstadoOblea.ASIGNADA,
      },
    });

    if (obleasAsignadas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el bloque porque tiene ${obleasAsignadas} obleas asignadas`,
      );
    }

    // Eliminar obleas asociadas primero
    await this.obleasRepository.delete({ bloque: { id } });

    // Eliminar bloque
    await this.bloquesRepository.remove(bloque);
  }

  async getEstadisticas(camaraId: number) {
    const totalBloques = await this.bloquesRepository.count({
      where: { camaraId },
    });
    const bloquesPorEstado = await this.bloquesRepository
      .createQueryBuilder('bloque')
      .select('bloque.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .where('bloque.camaraId = :camaraId', { camaraId })
      .groupBy('bloque.estado')
      .getRawMany();

    // Para obleas, filtrar solo las que pertenezcan a bloques de la cámara
    const totalObleas = await this.obleasRepository
      .createQueryBuilder('oblea')
      .innerJoin('oblea.bloque', 'bloque')
      .where('bloque.camaraId = :camaraId', { camaraId })
      .getCount();

    const obleasPorEstado = await this.obleasRepository
      .createQueryBuilder('oblea')
      .innerJoin('oblea.bloque', 'bloque')
      .select('oblea.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .where('bloque.camaraId = :camaraId', { camaraId })
      .groupBy('oblea.estado')
      .getRawMany();

    return {
      bloques: {
        total: totalBloques,
        porEstado: bloquesPorEstado,
      },
      obleas: {
        total: totalObleas,
        porEstado: obleasPorEstado,
      },
    };
  }
}
