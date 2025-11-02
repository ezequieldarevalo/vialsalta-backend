import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Revision } from './entities/revision.entity';
import { Oblea } from '../obleas/entities/oblea.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { UpdateRevisionDto } from './dto/update-revision.dto';
import { ResultadoRevision, EstadoOblea, UserRole } from '../common/enums';
import { CertificadosService } from '../certificados/certificados.service';

/**
 * Servicio de gestión de revisiones técnicas
 */
@Injectable()
export class RevisionesService {
  constructor(
    @InjectRepository(Revision)
    private revisionesRepository: Repository<Revision>,
    @InjectRepository(Oblea)
    private obleasRepository: Repository<Oblea>,
    @InjectRepository(Vehiculo)
    private vehiculosRepository: Repository<Vehiculo>,
    @Inject(forwardRef(() => CertificadosService))
    private certificadosService: CertificadosService,
  ) {}

  /**
   * Crear una nueva revisión técnica
   */
  async create(
    createRevisionDto: CreateRevisionDto,
    user: any,
  ): Promise<Revision> {
    const {
      vehiculoId,
      plantaId,
      resultado,
      observaciones,
      urlFoto,
      kilometraje,
      fechaRevision,
    } = createRevisionDto;

    // Verificar que el vehículo existe
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { id: vehiculoId },
    });
    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${vehiculoId} no encontrado`,
      );
    }

    // Determinar la planta (la del usuario o la especificada)
    const plantaFinal = plantaId || user.plantaId;
    if (!plantaFinal) {
      throw new BadRequestException(
        'Debe especificar una planta o el usuario debe tener una planta asignada',
      );
    }

    // Calcular fecha de vencimiento solo si es APROBADO (1 año)
    let fechaVencimiento: Date | null = null;
    if (resultado === ResultadoRevision.APROBADO) {
      const fecha = fechaRevision ? new Date(fechaRevision) : new Date();
      fechaVencimiento = new Date(fecha);
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
    }

    const revision = this.revisionesRepository.create({
      plantaId: plantaFinal,
      vehiculoId,
      usuarioId: user.sub,
      resultado,
      observaciones,
      urlFoto,
      kilometraje,
      fechaRevision: fechaRevision ? new Date(fechaRevision) : new Date(),
      fechaVencimiento: fechaVencimiento || undefined,
    });

    return this.revisionesRepository.save(revision);
  }

  /**
   * Asignar oblea a una revisión aprobada
   * Solo revisiones APROBADAS sin oblea pueden recibir una
   */
  async asignarOblea(revisionId: number, user: any): Promise<Revision> {
    // Buscar la revisión
    const revision = await this.revisionesRepository.findOne({
      where: { id: revisionId },
      relations: ['vehiculo', 'planta'],
    });

    if (!revision) {
      throw new NotFoundException(
        `Revisión con ID ${revisionId} no encontrada`,
      );
    }

    // Validar que la revisión está APROBADA
    if (revision.resultado !== ResultadoRevision.APROBADO) {
      throw new BadRequestException(
        'Solo se pueden asignar obleas a revisiones APROBADAS',
      );
    }

    // Validar que no tiene oblea ya asignada
    if (revision.oleaId) {
      throw new BadRequestException(
        'Esta revisión ya tiene una oblea asignada',
      );
    }

    // Validar permisos: solo PLANTA_ADMIN de la misma planta puede asignar oblea
    if (
      user.role === UserRole.PLANTA_ADMIN &&
      revision.plantaId !== user.plantaId
    ) {
      throw new ForbiddenException(
        'No tiene permisos para asignar obleas a revisiones de otra planta',
      );
    }

    // Obtener camaraId: si el usuario tiene camaraId directo, usar ese; sino, obtenerlo de la planta
    let camaraId = user.camaraId;
    if (!camaraId && revision.planta?.camaraId) {
      camaraId = revision.planta.camaraId;
    }

    if (!camaraId) {
      throw new BadRequestException('No se pudo determinar la cámara');
    }

    // Buscar la siguiente oblea disponible en la cámara
    const obleaDisponible = await this.obleasRepository.findOne({
      where: {
        camaraId: camaraId,
        estado: EstadoOblea.DISPONIBLE,
      },
      relations: ['bloque'],
      order: { numero: 'ASC' }, // Asignar en orden consecutivo
    });

    if (!obleaDisponible) {
      throw new BadRequestException('No hay obleas disponibles en esta cámara');
    }

    // Si hay planta asignada, verificar que la oblea sea de bloques sin planta o de la misma planta
    if (revision.plantaId) {
      if (
        obleaDisponible.bloque.plantaId &&
        obleaDisponible.bloque.plantaId !== revision.plantaId
      ) {
        // Buscar oblea de la planta específica o sin planta asignada
        const obleaEspecifica = await this.obleasRepository
          .createQueryBuilder('oblea')
          .innerJoin('oblea.bloque', 'bloque')
          .where('oblea.camaraId = :camaraId', { camaraId: camaraId })
          .andWhere('oblea.estado = :estado', {
            estado: EstadoOblea.DISPONIBLE,
          })
          .andWhere(
            '(bloque.plantaId = :plantaId OR bloque.plantaId IS NULL)',
            { plantaId: revision.plantaId },
          )
          .orderBy('oblea.numero', 'ASC')
          .getOne();

        if (!obleaEspecifica) {
          throw new BadRequestException(
            'No hay obleas disponibles para esta planta',
          );
        }

        // Usar esta oblea en lugar de la primera encontrada
        obleaDisponible.id = obleaEspecifica.id;
        obleaDisponible.numero = obleaEspecifica.numero;
      }
    }

    // Marcar la oblea como ASIGNADA
    obleaDisponible.estado = EstadoOblea.ASIGNADA;
    obleaDisponible.fechaAsignacion = new Date();
    await this.obleasRepository.save(obleaDisponible);

    // Asignar la oblea a la revisión
    revision.oleaId = obleaDisponible.id;
    await this.revisionesRepository.save(revision);

    // GENERAR CERTIFICADO AUTOMÁTICAMENTE
    console.log(
      `🎯 [ASIGNAR OBLEA] Punto 1: Voy a generar certificado para revisión ${revisionId}`,
    );
    console.log(
      `🎯 [ASIGNAR OBLEA] Punto 2: certificadosService está definido?`,
      !!this.certificadosService,
    );

    try {
      console.log(
        `🎯 [ASIGNAR OBLEA] Punto 3: Llamando a generarCertificado...`,
      );
      const certificado =
        await this.certificadosService.generarCertificado(revisionId);
      console.log(
        `✅ [ASIGNAR OBLEA] Punto 4: Certificado generado exitosamente:`,
        certificado.id,
      );
    } catch (error) {
      console.error(
        `❌ [ASIGNAR OBLEA] Punto 5: Error al generar certificado para revisión ${revisionId}:`,
        error.message,
      );
      console.error(`❌ [ASIGNAR OBLEA] Stack trace:`, error.stack);
      // No fallar la asignación de oblea si falla el certificado
    }

    // Retornar con relaciones cargadas
    const revisionActualizada = await this.revisionesRepository.findOne({
      where: { id: revisionId },
      relations: ['vehiculo', 'planta', 'oblea', 'usuario'],
    });

    if (!revisionActualizada) {
      throw new NotFoundException('No se pudo recargar la revisión');
    }

    return revisionActualizada;
  }

  /**
   * Listar todas las revisiones (filtradas por cámara del usuario)
   */
  async findAll(user: any): Promise<Revision[]> {
    const query = this.revisionesRepository
      .createQueryBuilder('revision')
      .leftJoinAndSelect('revision.vehiculo', 'vehiculo')
      .leftJoinAndSelect('revision.planta', 'planta')
      .leftJoinAndSelect('revision.oblea', 'oblea')
      .leftJoinAndSelect('revision.usuario', 'usuario');

    // Filtrar por cámara a través de la planta
    if (
      (user.role === UserRole.PLANTA_ADMIN ||
        user.role === UserRole.PLANTA_OPERADOR) &&
      user.plantaId
    ) {
      // Si es usuario de planta, solo ver revisiones de su planta
      query.where('revision.plantaId = :plantaId', {
        plantaId: user.plantaId,
      });
    } else {
      // Si es CAMARA o MUNICIPIO, filtrar por camaraId de la planta
      query.where('planta.camaraId = :camaraId', { camaraId: user.camaraId });
    }

    return query.orderBy('revision.fechaRevision', 'DESC').getMany();
  }

  /**
   * Obtener una revisión por ID
   */
  async findOne(id: number, user: any): Promise<Revision> {
    const revision = await this.revisionesRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'planta', 'oblea', 'usuario'],
    });

    if (!revision) {
      throw new NotFoundException(`Revisión con ID ${id} no encontrada`);
    }

    // Validar que pertenece a la cámara del usuario
    if (revision.planta.camaraId !== user.camaraId) {
      throw new ForbiddenException('No tiene acceso a esta revisión');
    }

    return revision;
  }

  /**
   * Actualizar una revisión
   * Solo se puede actualizar si NO tiene oblea asignada
   */
  async update(
    id: number,
    updateRevisionDto: UpdateRevisionDto,
    user: any,
  ): Promise<Revision> {
    const revision = await this.findOne(id, user);

    if (revision.oleaId) {
      throw new BadRequestException(
        'No se puede modificar una revisión que ya tiene oblea asignada',
      );
    }

    // Si cambia a APROBADO, calcular fecha de vencimiento
    if (
      updateRevisionDto.resultado === ResultadoRevision.APROBADO &&
      !revision.fechaVencimiento
    ) {
      const fecha = new Date();
      revision.fechaVencimiento = new Date(fecha);
      revision.fechaVencimiento.setFullYear(
        revision.fechaVencimiento.getFullYear() + 1,
      );
    }

    Object.assign(revision, updateRevisionDto);
    return this.revisionesRepository.save(revision);
  }

  /**
   * Eliminar una revisión
   * Solo si NO tiene oblea asignada
   */
  async remove(id: number, user: any): Promise<void> {
    const revision = await this.findOne(id, user);

    if (revision.oleaId) {
      throw new BadRequestException(
        'No se puede eliminar una revisión que tiene oblea asignada',
      );
    }

    await this.revisionesRepository.remove(revision);
  }

  /**
   * Obtener estadísticas de revisiones
   */
  async getEstadisticas(user: any): Promise<any> {
    const baseQuery = this.revisionesRepository
      .createQueryBuilder('revision')
      .leftJoin('revision.planta', 'planta')
      .where('planta.camaraId = :camaraId', { camaraId: user.camaraId });

    if (
      (user.role === UserRole.PLANTA_ADMIN ||
        user.role === UserRole.PLANTA_OPERADOR) &&
      user.plantaId
    ) {
      baseQuery.andWhere('revision.plantaId = :plantaId', {
        plantaId: user.plantaId,
      });
    }

    const [total, aprobadas, rechazadas, condicionales, conOblea] =
      await Promise.all([
        baseQuery.getCount(),
        baseQuery
          .clone()
          .andWhere('revision.resultado = :resultado', {
            resultado: ResultadoRevision.APROBADO,
          })
          .getCount(),
        baseQuery
          .clone()
          .andWhere('revision.resultado = :resultado', {
            resultado: ResultadoRevision.RECHAZADO,
          })
          .getCount(),
        baseQuery
          .clone()
          .andWhere('revision.resultado = :resultado', {
            resultado: ResultadoRevision.CONDICIONAL,
          })
          .getCount(),
        baseQuery.clone().andWhere('revision.oleaId IS NOT NULL').getCount(),
      ]);

    return {
      total,
      aprobadas,
      rechazadas,
      condicionales,
      conOblea,
      sinOblea: aprobadas - conOblea,
      tasaAprobacion:
        total > 0 ? ((aprobadas / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}
