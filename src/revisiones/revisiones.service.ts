import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CertificadosService))
    private certificadosService: CertificadosService,
  ) {}

  /**
   * 🔧 Calcular fecha de vencimiento según resultado, antigüedad del vehículo y revisiones previas
   *
   * Reglas de negocio:
   * - RECHAZADO: No tiene vencimiento (no se emite certificado)
   * - CONDICIONAL: 60 días desde la fecha de revisión
   * - APROBADO:
   *   * Vehículos con <= 7 años de antigüedad: 2 años de vigencia
   *   * Vehículos con > 7 años de antigüedad: 1 año de vigencia
   *   * Si tiene CONDICIONAL previa: Se resta el tiempo transcurrido entre condicional y aprobado
   */
  private async calcularFechaVencimiento(
    vehiculoId: number,
    resultado: ResultadoRevision,
    fechaRevision: Date,
  ): Promise<Date | null> {
    const fecha = new Date(fechaRevision);

    // RECHAZADO: No tiene vencimiento
    if (resultado === ResultadoRevision.RECHAZADO) {
      console.log('[calcularVencimiento] RECHAZADO → Sin vencimiento');
      return null;
    }

    // CONDICIONAL: 60 días desde la fecha de revisión
    if (resultado === ResultadoRevision.CONDICIONAL) {
      const vencimiento = new Date(fecha);
      vencimiento.setDate(vencimiento.getDate() + 60);
      console.log(
        `[calcularVencimiento] CONDICIONAL → 60 días: ${vencimiento.toISOString()}`,
      );
      return vencimiento;
    }

    // APROBADO: Calcular según antigüedad del vehículo
    const vehiculo = await this.prisma.vehiculos.findUnique({
      where: { id: vehiculoId },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${vehiculoId} no encontrado`,
      );
    }

    // Calcular antigüedad del vehículo
    const anioActual = new Date().getFullYear();
    const antiguedad = anioActual - vehiculo.anio;

    console.log(
      `[calcularVencimiento] Vehículo año ${vehiculo.anio}, antigüedad: ${antiguedad} años`,
    );

    // Determinar vigencia base según antigüedad
    const vigenciaAnios = antiguedad <= 7 ? 2 : 1;
    console.log(`[calcularVencimiento] Vigencia base: ${vigenciaAnios} año(s)`);

    // Verificar si hay revisión CONDICIONAL previa
    const revisionCondicionalPrevia = await this.prisma.revisiones.findFirst({
      where: {
        vehiculoId,
        resultado: ResultadoRevision.CONDICIONAL,
      },
      orderBy: {
        fechaRevision: 'desc',
      },
    });

    let diasADescontar = 0;
    if (revisionCondicionalPrevia) {
      // Calcular días transcurridos entre condicional y aprobado
      const fechaCondicional = new Date(
        revisionCondicionalPrevia.fechaRevision,
      );
      diasADescontar = Math.floor(
        (fecha.getTime() - fechaCondicional.getTime()) / (1000 * 60 * 60 * 24),
      );

      console.log('[calcularVencimiento] Condicional previa encontrada:');
      console.log(`  Fecha condicional: ${fechaCondicional.toISOString()}`);
      console.log(`  Fecha aprobado: ${fecha.toISOString()}`);
      console.log(`  Días transcurridos a descontar: ${diasADescontar}`);
    }

    // Calcular fecha de vencimiento
    const vencimiento = new Date(fecha);
    vencimiento.setFullYear(vencimiento.getFullYear() + vigenciaAnios);

    // Restar días de condicional si aplica
    if (diasADescontar > 0) {
      vencimiento.setDate(vencimiento.getDate() - diasADescontar);
      console.log(
        `[calcularVencimiento] APROBADO con ajuste por condicional → Vencimiento: ${vencimiento.toISOString()}`,
      );
    } else {
      console.log(
        `[calcularVencimiento] APROBADO sin condicional previa → ${vigenciaAnios} año(s): ${vencimiento.toISOString()}`,
      );
    }

    return vencimiento;
  }

  /**
   * Crear una nueva revisión técnica
   */
  async create(createRevisionDto: CreateRevisionDto, user: any) {
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
    const vehiculo = await this.prisma.vehiculos.findUnique({
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

    // 🔧 Calcular fecha de vencimiento usando la nueva lógica
    const fechaParaCalculo = fechaRevision
      ? new Date(fechaRevision)
      : new Date();
    const fechaVencimiento = await this.calcularFechaVencimiento(
      vehiculoId,
      resultado,
      fechaParaCalculo,
    );

    return this.prisma.revisiones.create({
      data: {
        plantaId: plantaFinal,
        vehiculoId,
        usuarioId: user.sub,
        resultado,
        observaciones,
        urlFoto,
        kilometraje,
        fechaRevision: fechaRevision ? new Date(fechaRevision) : new Date(),
        fechaVencimiento: fechaVencimiento || undefined,
      },
    });
  }

  /**
   * 🎯 Asignar oblea a una revisión aprobada
   * NUEVO FLUJO: Recibe el número de oblea escaneada/ingresada
   * Activa el QR al asignar
   */
  async asignarOblea(revisionId: number, numeroOblea: number, user: any) {
    // Buscar la revisión
    const revision = await this.prisma.revisiones.findUnique({
      where: { id: revisionId },
      include: { vehiculos: true, plantas: true },
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

    // Validar permisos: solo PLANTA_ADMIN/PLANTA_OPERADOR de la misma planta
    if (
      (user.role === UserRole.PLANTA_ADMIN ||
        user.role === UserRole.PLANTA_OPERADOR) &&
      revision.plantaId !== user.plantaId
    ) {
      throw new ForbiddenException(
        'No tiene permisos para asignar obleas a revisiones de otra planta',
      );
    }

    // 🔍 Buscar la oblea por número
    const oblea = await this.prisma.obleas.findUnique({
      where: { numero: numeroOblea },
      include: { bloques_obleas: true },
    });

    if (!oblea) {
      throw new NotFoundException(
        `Oblea con número ${numeroOblea} no encontrada`,
      );
    }

    // Validar que la oblea está DISPONIBLE
    if (oblea.estado !== EstadoOblea.DISPONIBLE) {
      throw new BadRequestException(
        `La oblea ${numeroOblea} no está disponible. Estado actual: ${oblea.estado}`,
      );
    }

    // Validar que la oblea pertenece a la misma cámara
    const camaraId = user.camaraId || revision.plantas?.camaraId;
    if (oblea.camaraId !== camaraId) {
      throw new BadRequestException('La oblea no pertenece a la misma cámara');
    }

    // Si hay planta específica, validar que la oblea puede usarse en esa planta
    if (revision.plantaId && oblea.bloques_obleas.plantaId) {
      if (oblea.bloques_obleas.plantaId !== revision.plantaId) {
        throw new BadRequestException(
          `La oblea ${numeroOblea} está asignada a otra planta`,
        );
      }
    }

    // ✅ Marcar la oblea como ASIGNADA y ACTIVAR EL QR
    await this.prisma.obleas.update({
      where: { numero: numeroOblea },
      data: {
        estado: EstadoOblea.ASIGNADA,
        fechaAsignacion: new Date(),
        qrActivo: true, // 🎯 ACTIVAR QR
        plantaId: revision.plantaId,
        revisionId,
      },
    });

    // 🎯 RECALCULAR FECHA DE VENCIMIENTO AL ASIGNAR OBLEA
    // Este es el momento oficial de aprobación, no al crear la revisión
    console.log(
      `🔄 [ASIGNAR OBLEA] Recalculando fecha de vencimiento para revisión ${revisionId}`,
    );

    const nuevaFechaVencimiento = await this.calcularFechaVencimiento(
      revision.vehiculoId,
      revision.resultado as ResultadoRevision,
      revision.fechaRevision,
    );

    // Asignar la oblea a la revisión y actualizar fecha de vencimiento
    await this.prisma.revisiones.update({
      where: { id: revisionId },
      data: {
        oleaId: oblea.id,
        fechaVencimiento: nuevaFechaVencimiento || undefined,
      },
    });

    if (nuevaFechaVencimiento) {
      console.log(
        `✅ [ASIGNAR OBLEA] Nueva fecha de vencimiento: ${nuevaFechaVencimiento.toISOString()}`,
      );
    }

    // GENERAR CERTIFICADO AUTOMÁTICAMENTE
    console.log(
      `🎯 [ASIGNAR OBLEA] Generando certificado para revisión ${revisionId} con oblea ${numeroOblea}`,
    );

    try {
      const certificado =
        await this.certificadosService.generarCertificado(revisionId);
      console.log(
        `✅ [ASIGNAR OBLEA] Certificado generado exitosamente:`,
        certificado.id,
      );
    } catch (error) {
      console.error(
        `❌ [ASIGNAR OBLEA] Error al generar certificado:`,
        error.message,
      );
      // No fallar la asignación de oblea si falla el certificado
    }

    // Retornar con relaciones cargadas
    const revisionActualizada = await this.prisma.revisiones.findUnique({
      where: { id: revisionId },
      include: {
        vehiculos: true,
        plantas: true,
        obleas: true,
        users: true,
      },
    });

    if (!revisionActualizada) {
      throw new NotFoundException('No se pudo recargar la revisión');
    }

    return revisionActualizada;
  }

  /**
   * Listar todas las revisiones (filtradas por cámara del usuario)
   */
  async findAll(user: any) {
    console.log('[findAll] 🔍 Usuario consultando:', {
      userId: user.sub,
      role: user.role,
      plantaId: user.plantaId,
      camaraId: user.camaraId,
    });

    // Filtrar por cámara a través de la planta
    if (
      (user.role === UserRole.PLANTA_ADMIN ||
        user.role === UserRole.PLANTA_OPERADOR) &&
      user.plantaId
    ) {
      console.log('[findAll] ✓ Filtrando por plantaId:', user.plantaId);
      // Si es usuario de planta, solo ver revisiones de su planta
      const results = await this.prisma.revisiones.findMany({
        where: { plantaId: user.plantaId },
        include: {
          vehiculos: true,
          plantas: true,
          obleas: true,
          users: true,
        },
        orderBy: { fechaRevision: 'desc' },
      });
      console.log('[findAll] 📋 Revisiones encontradas:', results.length);
      return results;
    } else if (user.camaraId) {
      console.log('[findAll] ✓ Filtrando por camaraId:', user.camaraId);
      // Si es CAMARA o MUNICIPIO, filtrar por camaraId de la planta
      const results = await this.prisma.revisiones.findMany({
        where: {
          plantas: { camaraId: user.camaraId },
        },
        include: {
          vehiculos: true,
          plantas: true,
          obleas: true,
          users: true,
        },
        orderBy: { fechaRevision: 'desc' },
      });
      console.log('[findAll] 📋 Revisiones encontradas:', results.length);
      return results;
    } else {
      console.warn(
        '[findAll] ⚠️  Usuario sin plantaId ni camaraId - mostrando TODAS las revisiones',
      );
      // No aplicar filtro (útil para debugging o admin global)
      const results = await this.prisma.revisiones.findMany({
        include: {
          vehiculos: true,
          plantas: true,
          obleas: true,
          users: true,
        },
        orderBy: { fechaRevision: 'desc' },
      });
      console.log('[findAll] 📋 Revisiones encontradas:', results.length);
      return results;
    }
  }

  /**
   * Obtener una revisión por ID
   */
  async findOne(id: number, user: any) {
    const revision = await this.prisma.revisiones.findUnique({
      where: { id },
      include: {
        vehiculos: true,
        plantas: true,
        obleas: true,
        users: true,
      },
    });

    if (!revision) {
      throw new NotFoundException(`Revisión con ID ${id} no encontrada`);
    }

    // Validar que pertenece a la cámara del usuario
    if (revision.plantas.camaraId !== user.camaraId) {
      throw new ForbiddenException('No tiene acceso a esta revisión');
    }

    return revision;
  }

  /**
   * Actualizar una revisión
   * Solo se puede actualizar si NO tiene oblea asignada
   */
  async update(id: number, updateRevisionDto: UpdateRevisionDto, user: any) {
    const revision = await this.findOne(id, user);

    if (revision.oleaId) {
      throw new BadRequestException(
        'No se puede modificar una revisión que ya tiene oblea asignada',
      );
    }

    // Si cambia el resultado, recalcular fecha de vencimiento
    let fechaVencimiento;
    if (
      updateRevisionDto.resultado &&
      updateRevisionDto.resultado !== revision.resultado
    ) {
      fechaVencimiento = await this.calcularFechaVencimiento(
        revision.vehiculoId,
        updateRevisionDto.resultado,
        revision.fechaRevision,
      );
    }

    return this.prisma.revisiones.update({
      where: { id },
      data: {
        ...updateRevisionDto,
        ...(fechaVencimiento !== undefined && { fechaVencimiento }),
      },
    });
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

    await this.prisma.revisiones.delete({ where: { id } });
  }

  /**
   * Obtener estadísticas de revisiones
   */
  async getEstadisticas(user: any): Promise<any> {
    let whereClause: any = {};

    // Filtrar por cámara del usuario
    if (
      (user.role === UserRole.PLANTA_ADMIN ||
        user.role === UserRole.PLANTA_OPERADOR) &&
      user.plantaId
    ) {
      whereClause = { plantaId: user.plantaId };
    } else if (user.camaraId) {
      whereClause = { plantas: { camaraId: user.camaraId } };
    }

    const [total, aprobadas, rechazadas, condicionales, conOblea] =
      await Promise.all([
        this.prisma.revisiones.count({ where: whereClause }),
        this.prisma.revisiones.count({
          where: { ...whereClause, resultado: ResultadoRevision.APROBADO },
        }),
        this.prisma.revisiones.count({
          where: { ...whereClause, resultado: ResultadoRevision.RECHAZADO },
        }),
        this.prisma.revisiones.count({
          where: {
            ...whereClause,
            resultado: ResultadoRevision.CONDICIONAL,
          },
        }),
        this.prisma.revisiones.count({
          where: { ...whereClause, oleaId: { not: null } },
        }),
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
