import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloqueDto } from './dto/create-bloque.dto';
import { UpdateBloqueDto } from './dto/update-bloque.dto';
import { EstadoBloque, EstadoOblea } from '../common/enums';
import * as crypto from 'crypto';

@Injectable()
export class BloquesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera el código QR para una oblea
   * Incluye firma digital para evitar falsificaciones
   */
  /**
   * Genera el código QR para una oblea
   * Retorna la URL completa de verificación
   */
  private generateQRCode(numero: number, bloqueId: number): string {
    // Firma digital para evitar falsificaciones
    const signature = crypto
      .createHash('sha256')
      .update(
        `${numero}-${bloqueId}-${process.env.QR_SECRET || 'default-secret'}`,
      )
      .digest('hex')
      .substring(0, 16);

    const codigo = `OBL-${numero}-${signature}`;

    // 🌐 URL completa de verificación
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/verificar/${codigo}`;
  }

  async create(createBloqueDto: CreateBloqueDto, camaraId: number) {
    const { cantidad, plantaId } = createBloqueDto;

    // Verificar que la cámara exista y obtener su código
    const camara = await this.prisma.camaras.findUnique({
      where: { id: camaraId },
    });
    if (!camara) {
      throw new NotFoundException(`Cámara con ID ${camaraId} no encontrada`);
    }

    // Obtener el último bloque de esta cámara para generar el código
    const lastBloque = await this.prisma.bloques_obleas.findFirst({
      where: { camaraId },
      orderBy: { createdAt: 'desc' },
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
    const existingBloque = await this.prisma.bloques_obleas.findUnique({
      where: { codigo },
    });
    if (existingBloque) {
      throw new ConflictException(
        `Error al generar código de bloque. Contacte al administrador.`,
      );
    }

    // Calcular el rango de números automáticamente
    // Buscar el último número usado en esta cámara
    const lastBloqueWithNumbers = await this.prisma.bloques_obleas.findFirst({
      where: { camaraId },
      orderBy: { numeroFin: 'desc' },
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
    let planta: any = null;
    if (plantaId) {
      planta = await this.prisma.plantas.findFirst({
        where: { id: plantaId, camaraId },
      });
      if (!planta) {
        throw new NotFoundException(
          `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
        );
      }
    }

    // Crear el bloque
    const bloque = await this.prisma.bloques_obleas.create({
      data: {
        codigo,
        numeroInicio,
        numeroFin,
        cantidadTotal: cantidad,
        estado: plantaId ? EstadoBloque.ASIGNADO : EstadoBloque.CREADO,
        camaraId,
        plantaId: planta?.id || null,
      },
    });

    // 🎯 Crear obleas con QR generado automáticamente
    const obleas: any[] = [];
    for (let i = numeroInicio; i <= numeroFin; i++) {
      const codigoQr = this.generateQRCode(i, bloque.id);
      obleas.push({
        numero: i,
        codigoQr, // ✨ QR generado
        qrActivo: false, // ✨ QR inactivo por defecto
        estado: EstadoOblea.DISPONIBLE,
        camaraId: camaraId,
        bloqueId: bloque.id,
      });
    }

    await this.prisma.obleas.createMany({ data: obleas });

    return this.findOne(bloque.id, camaraId);
  }

  async findAll(camaraId: number) {
    return this.prisma.bloques_obleas.findMany({
      where: { camaraId },
      include: { plantas: true, obleas: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, camaraId: number) {
    const bloque = await this.prisma.bloques_obleas.findFirst({
      where: { id, camaraId },
      include: {
        plantas: { include: { municipios: true } },
        obleas: true,
      },
    });

    if (!bloque) {
      throw new NotFoundException(
        `Bloque con ID ${id} no encontrado o no pertenece a su cámara`,
      );
    }

    return bloque;
  }

  async findByPlanta(plantaId: number, camaraId: number) {
    // Verificar que la planta pertenezca a la cámara
    const planta = await this.prisma.plantas.findFirst({
      where: { id: plantaId, camaraId },
    });
    if (!planta) {
      throw new NotFoundException(
        `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
      );
    }

    return this.prisma.bloques_obleas.findMany({
      where: { plantaId, camaraId },
      include: { plantas: true, obleas: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updateBloqueDto: UpdateBloqueDto, camaraId: number) {
    const bloque = await this.findOne(id, camaraId);

    // Solo permitir cambiar la planta asignada y el estado
    // No se pueden modificar rangos ni cantidades después de crear el bloque

    const updateData: any = {};

    // Si se cambia la planta, verificar que pertenezca a la misma cámara
    if (updateBloqueDto.plantaId) {
      const planta = await this.prisma.plantas.findFirst({
        where: { id: updateBloqueDto.plantaId, camaraId },
      });
      if (!planta) {
        throw new NotFoundException(
          `Planta con ID ${updateBloqueDto.plantaId} no encontrada o no pertenece a su cámara`,
        );
      }
      updateData.plantaId = updateBloqueDto.plantaId;
      updateData.estado = EstadoBloque.ASIGNADO;
    }

    if (updateBloqueDto.estado) {
      updateData.estado = updateBloqueDto.estado;
    }

    return this.prisma.bloques_obleas.update({
      where: { id },
      data: updateData,
    });
  }

  async asignarPlanta(id: number, plantaId: number, camaraId: number) {
    const bloque = await this.findOne(id, camaraId);

    // Verificar que el bloque esté en estado CREADO
    if (bloque.estado !== EstadoBloque.CREADO) {
      throw new BadRequestException(
        `El bloque debe estar en estado CREADO para ser asignado. Estado actual: ${bloque.estado}`,
      );
    }

    // Verificar que la planta exista y pertenezca a la misma cámara
    const planta = await this.prisma.plantas.findFirst({
      where: { id: plantaId, camaraId },
    });
    if (!planta) {
      throw new NotFoundException(
        `Planta con ID ${plantaId} no encontrada o no pertenece a su cámara`,
      );
    }

    // Asignar planta y cambiar estado
    return this.prisma.bloques_obleas.update({
      where: { id },
      data: {
        plantaId,
        estado: EstadoBloque.ASIGNADO,
      },
    });
  }

  async remove(id: number, camaraId: number): Promise<void> {
    const bloque = await this.findOne(id, camaraId);

    // No permitir eliminar si tiene obleas asignadas
    const obleasAsignadas = await this.prisma.obleas.count({
      where: {
        bloqueId: id,
        estado: EstadoOblea.ASIGNADA,
      },
    });

    if (obleasAsignadas > 0) {
      throw new BadRequestException(
        `No se puede eliminar el bloque porque tiene ${obleasAsignadas} obleas asignadas`,
      );
    }

    // Eliminar obleas asociadas primero
    await this.prisma.obleas.deleteMany({ where: { bloqueId: id } });

    // Eliminar bloque
    await this.prisma.bloques_obleas.delete({ where: { id } });
  }

  async getEstadisticas(camaraId: number) {
    const totalBloques = await this.prisma.bloques_obleas.count({
      where: { camaraId },
    });

    const bloquesPorEstado = await this.prisma.bloques_obleas.groupBy({
      by: ['estado'],
      where: { camaraId },
      _count: true,
    });

    // Para obleas, filtrar solo las que pertenezcan a bloques de la cámara
    const obleasData = await this.prisma.obleas.findMany({
      where: { bloques_obleas: { camaraId } },
      select: { estado: true },
    });

    const totalObleas = obleasData.length;

    const obleasPorEstado = obleasData.reduce((acc: any[], oblea) => {
      const existing = acc.find((item) => item.estado === oblea.estado);
      if (existing) {
        existing.cantidad = String(Number(existing.cantidad) + 1);
      } else {
        acc.push({ estado: oblea.estado, cantidad: '1' });
      }
      return acc;
    }, []);

    return {
      bloques: {
        total: totalBloques,
        porEstado: bloquesPorEstado.map((item) => ({
          estado: item.estado,
          cantidad: String(item._count),
        })),
      },
      obleas: {
        total: totalObleas,
        porEstado: obleasPorEstado,
      },
    };
  }

  /**
   * 📥 Genera CSV con el detalle de obleas de un bloque
   * Para mandar a imprimir
   */
  async generarCSV(id: number, camaraId: number): Promise<string> {
    const bloque = await this.findOne(id, camaraId);

    if (!bloque.obleas || bloque.obleas.length === 0) {
      throw new NotFoundException('El bloque no tiene obleas asociadas');
    }

    // Header del CSV
    let csv = 'Numero,CodigoQR,Estado,QRActivo,Bloque,FechaCreacion\n';

    // Datos
    for (const oblea of bloque.obleas) {
      csv += `${oblea.numero},${oblea.codigoQr},${oblea.estado},${oblea.qrActivo ? 'SI' : 'NO'},${bloque.codigo},${oblea.createdAt.toISOString()}\n`;
    }

    return csv;
  }
}
