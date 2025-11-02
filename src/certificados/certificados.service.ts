import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Certificado } from './entities/certificado.entity';
import { Revision } from '../revisiones/entities/revision.entity';
import * as QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as crypto from 'crypto';

@Injectable()
export class CertificadosService {
  private readonly QR_SECRET: string;

  constructor(
    @InjectRepository(Certificado)
    private certificadosRepository: Repository<Certificado>,
    @InjectRepository(Revision)
    private revisionesRepository: Repository<Revision>,
  ) {
    // Usar variable de entorno o generar secreto único
    this.QR_SECRET = process.env.QR_SECRET || this.generateSecret();
    if (!process.env.QR_SECRET) {
      console.warn(
        '⚠️  QR_SECRET no definido en .env - usando secreto temporal. Define QR_SECRET para producción.',
      );
    }
  }

  /**
   * Genera un secreto aleatorio para firmar QRs (solo desarrollo)
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera una firma HMAC-SHA256 para el código QR
   * Esto previene falsificación y modificación de códigos QR
   */
  private generateQRSignature(data: {
    oleaNumero: number;
    revisionId: number;
    timestamp: number;
  }): string {
    const payload = `${data.oleaNumero}-${data.revisionId}-${data.timestamp}`;
    return crypto
      .createHmac('sha256', this.QR_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 16); // 16 caracteres = 64 bits de seguridad
  }

  /**
   * Valida la firma de un código QR
   */
  private validateQRSignature(
    uniqueCode: string,
    certificado: Certificado,
  ): boolean {
    try {
      // Formato esperado: QR-{oleaNumero}-{timestamp}-{revisionId}-{signature}
      const parts = uniqueCode.split('-');
      if (parts.length !== 5 || parts[0] !== 'QR') {
        console.error('[validateQRSignature] ❌ Formato de código inválido');
        return false;
      }

      const oleaNumero = parseInt(parts[1]);
      const timestamp = parseInt(parts[2]);
      const revisionId = parseInt(parts[3]);
      const providedSignature = parts[4];

      // Generar firma esperada
      const expectedSignature = this.generateQRSignature({
        oleaNumero,
        revisionId,
        timestamp,
      });

      const isValid = providedSignature === expectedSignature;

      if (!isValid) {
        console.error('[validateQRSignature] ❌ INTENTO DE FRAUDE DETECTADO');
        console.error('  Código proporcionado:', uniqueCode);
        console.error('  Firma proporcionada:', providedSignature);
        console.error('  Firma esperada:', expectedSignature);
        console.error('  Certificado ID:', certificado.id);
        console.error('  Timestamp:', new Date(timestamp).toISOString());
      }

      return isValid;
    } catch (error) {
      console.error('[validateQRSignature] Error al validar firma:', error);
      return false;
    }
  }

  /**
   * Valida que el certificado esté vigente
   */
  private validateCertificateValidity(certificado: Certificado): {
    valid: boolean;
    reason?: string;
  } {
    const now = new Date();
    const emision = new Date(certificado.fechaEmision);
    const vencimiento = new Date(certificado.fechaVencimiento);

    // Verificar que no sea del futuro
    if (emision > now) {
      return {
        valid: false,
        reason: 'Certificado emitido en fecha futura (posible falsificación)',
      };
    }

    // Verificar vencimiento
    if (vencimiento < now) {
      return { valid: false, reason: 'Certificado vencido' };
    }

    // Verificar que la emisión sea anterior al vencimiento
    if (emision >= vencimiento) {
      return {
        valid: false,
        reason: 'Fechas inconsistentes (posible manipulación)',
      };
    }

    return { valid: true };
  }

  async generarCertificado(revisionId: number): Promise<Certificado> {
    const revision = await this.revisionesRepository.findOne({
      where: { id: revisionId },
      relations: ['vehiculo', 'oblea', 'planta', 'usuario', 'planta.camara'],
    });

    if (!revision) {
      throw new NotFoundException('Revisión no encontrada');
    }

    if (!revision.oblea) {
      throw new NotFoundException(
        'No se puede generar certificado sin oblea asignada',
      );
    }

    let certificado = await this.certificadosRepository.findOne({
      where: { revision: { id: revisionId } },
    });

    if (certificado) {
      console.log('✅ Certificado ya existe:', certificado.id);
      return certificado;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const timestamp = Date.now();

    // Generar firma criptográfica para prevenir falsificación
    const signature = this.generateQRSignature({
      oleaNumero: revision.oblea.numero,
      revisionId: revision.id,
      timestamp,
    });

    // Código único firmado: QR-{oblea}-{timestamp}-{revisionId}-{signature}
    const uniqueCode = `QR-${revision.oblea.numero}-${timestamp}-${revision.id}-${signature}`;
    const urlVerificacion = `${frontendUrl}/verificar/${uniqueCode}`;

    console.log('[generarCertificado] 🔒 Código firmado generado:', uniqueCode);
    console.log('[generarCertificado] URL verificación:', urlVerificacion);

    const codigoQr = await QRCode.toDataURL(urlVerificacion);

    console.log('[generarCertificado] Código QR generado');

    certificado = this.certificadosRepository.create({
      revision,
      oleaId: revision.oleaId,
      urlVerificacion,
      codigoQr,
      fechaEmision: new Date(),
      numeroCertificado: `CERT-${revisionId}-${Date.now()}`,
      fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await this.certificadosRepository.save(certificado);

    console.log('✅ Certificado guardado:', certificado.id);

    return certificado;
  }

  async generarPDF(revisionId: number): Promise<Buffer> {
    console.log('[generarPDF] Inicio - revisionId:', revisionId);

    const revision = await this.revisionesRepository.findOne({
      where: { id: revisionId },
      relations: ['vehiculo', 'oblea', 'planta', 'usuario', 'planta.camara'],
    });

    if (!revision) {
      throw new NotFoundException('Revisión no encontrada');
    }

    console.log('[generarPDF] Revisión encontrada:', revision.id);

    await this.generarCertificado(revisionId);

    // 🔧 WORKAROUND: Query SQL directo para obtener el QR
    console.log('[generarPDF] 🔧 WORKAROUND v3: Ejecutando query SQL directo');
    const qrResult = await this.certificadosRepository.query(
      'SELECT "codigoQr" FROM certificados WHERE "revisionId" = $1',
      [revisionId],
    );
    const codigoQrFromDB = qrResult[0]?.codigoQr;
    console.log(
      '[generarPDF] ✅ QR obtenido:',
      !!codigoQrFromDB,
      'longitud:',
      codigoQrFromDB?.length || 0,
    );

    const certificado = await this.certificadosRepository.findOne({
      where: { revisionId },
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    console.log(
      '[generarPDF] Certificado cargado:',
      certificado.numeroCertificado,
    );

    // �� WORKAROUND: Inyectar el QR desde DB
    if (!certificado.codigoQr && codigoQrFromDB) {
      console.log('[generarPDF] 🔧 Inyectando QR desde DB');
      certificado.codigoQr = codigoQrFromDB;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    page.drawText('CERTIFICADO DE REVISIÓN TÉCNICA VEHICULAR', {
      x: 50,
      y: yPosition,
      size: 20,
      font: fontBold,
      color: rgb(0, 0, 0.5),
    });

    yPosition -= 30;
    page.drawText(`Provincia: ${revision.planta.camara.provincia}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;
    page.drawText(`Cámara: ${revision.planta.camara.nombre}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;
    page.drawText(`Planta: ${revision.planta.nombre}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 40;

    page.drawText('INFORMACIÓN DEL VEHÍCULO', {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });
    yPosition -= 25;
    page.drawText(`Dominio: ${revision.vehiculo.dominio}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;
    page.drawText(
      `Marca: ${revision.vehiculo.marca} - Modelo: ${revision.vehiculo.modelo}`,
      { x: 50, y: yPosition, size: 12, font },
    );
    yPosition -= 20;
    page.drawText(`Año: ${revision.vehiculo.anio}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 40;

    page.drawText('RESULTADO DE LA REVISIÓN', {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });
    yPosition -= 25;
    const resultadoColor =
      revision.resultado === 'APROBADO' ? rgb(0, 0.5, 0) : rgb(0.5, 0, 0);
    page.drawText(`Resultado: ${revision.resultado}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
      color: resultadoColor,
    });
    yPosition -= 20;
    page.drawText(
      `Fecha: ${new Date(revision.fechaRevision).toLocaleDateString('es-AR')}`,
      { x: 50, y: yPosition, size: 12, font },
    );
    yPosition -= 20;
    page.drawText(`Inspector: ${revision.usuario.nombre}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 40;

    page.drawText('OBLEA', { x: 50, y: yPosition, size: 14, font: fontBold });
    yPosition -= 25;
    page.drawText(`Número: ${revision.oblea.numero}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });
    yPosition -= 20;

    if (revision.oblea.fechaAsignacion) {
      page.drawText(
        `Fecha de asignación: ${new Date(revision.oblea.fechaAsignacion).toLocaleDateString('es-AR')}`,
        { x: 50, y: yPosition, size: 12, font },
      );
      yPosition -= 30;
    }

    page.drawText('URL de verificación:', {
      x: 50,
      y: yPosition,
      size: 10,
      font,
    });
    yPosition -= 15;
    page.drawText(certificado.urlVerificacion || 'N/A', {
      x: 50,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0, 0, 0.8),
    });
    yPosition -= 25;

    if (certificado.codigoQr) {
      try {
        console.log('[generarPDF] ✅ Procesando QR para PDF...');
        // Extraer base64 del data URL (quitar "data:image/png;base64,")
        const base64Data = certificado.codigoQr.replace(
          /^data:image\/png;base64,/,
          '',
        );
        console.log(
          '[generarPDF] ✅ Base64 extraído, longitud:',
          base64Data.length,
        );

        // Convertir a Buffer
        const qrImageBytes = Buffer.from(base64Data, 'base64');
        console.log(
          '[generarPDF] ✅ Buffer creado, tamaño:',
          qrImageBytes.length,
          'bytes',
        );

        // Embeber en el PDF
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        console.log('[generarPDF] ✅ PNG embebido exitosamente');

        const qrDims = qrImage.scale(0.3);
        page.drawImage(qrImage, {
          x: 50,
          y: yPosition - 50,
          width: qrDims.width,
          height: qrDims.height,
        });
        page.drawText('Escanee para verificar:', {
          x: 50,
          y: yPosition - 65,
          size: 10,
          font,
        });
        console.log('[generarPDF] ✅ IMAGEN QR DIBUJADA EN EL PDF');
      } catch (error) {
        console.error('[generarPDF] ❌ Error al insertar QR:', error);
        page.drawText(`Código QR: Error al generar imagen`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
      }
    } else {
      console.log('[generarPDF] ⚠️ No hay codigoQr en el certificado');
      page.drawText(`Código QR: Pendiente`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
    }

    yPosition -= 30;

    page.drawText(
      `Emitido: ${new Date(certificado.fechaEmision).toLocaleDateString('es-AR')}`,
      { x: 50, y: 50, size: 8, font },
    );
    page.drawText('Documento con validez legal', {
      x: 50,
      y: 35,
      size: 8,
      font,
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    console.log('[generarPDF] PDF generado - Tamaño:', buffer.length, 'bytes');
    console.log('[generarPDF] Es Buffer?:', Buffer.isBuffer(buffer));

    return buffer;
  }

  async verificarPorCodigoQr(codigoQr: string) {
    console.log('[verificarPorCodigoQr] 🔍 Verificando certificado:', codigoQr);

    // Extraer componentes del código QR
    // Formato: QR-{oleaNumero}-{timestamp}-{revisionId}-{signature}
    const parts = codigoQr.split('-');
    if (parts.length !== 5 || parts[0] !== 'QR') {
      console.error('[verificarPorCodigoQr] ❌ Formato de código inválido');
      throw new NotFoundException('Código QR inválido');
    }

    const oleaNumero = parseInt(parts[1]);
    const timestamp = parseInt(parts[2]);
    const revisionId = parseInt(parts[3]);
    const providedSignature = parts[4];

    // Buscar certificado por URL de verificación (búsqueda parcial)
    // Buscaremos por el patrón base y luego validaremos la firma
    const searchPattern = `%-${timestamp}-${revisionId}-%`;
    const certificado = await this.certificadosRepository
      .createQueryBuilder('certificado')
      .leftJoinAndSelect('certificado.revision', 'revision')
      .leftJoinAndSelect('revision.vehiculo', 'vehiculo')
      .leftJoinAndSelect('revision.oblea', 'oblea')
      .leftJoinAndSelect('revision.planta', 'planta')
      .leftJoinAndSelect('planta.camara', 'camara')
      .where('certificado.urlVerificacion LIKE :pattern', {
        pattern: searchPattern,
      })
      .getOne();

    if (!certificado) {
      console.log(
        '[verificarPorCodigoQr] ❌ Certificado no encontrado:',
        codigoQr,
      );
      throw new NotFoundException('Certificado no encontrado');
    }

    console.log(
      '[verificarPorCodigoQr] ✅ Certificado encontrado:',
      certificado.numeroCertificado,
    );

    // 🔒 VALIDACIÓN 1: Verificar firma criptográfica
    const expectedSignature = this.generateQRSignature({
      oleaNumero,
      revisionId,
      timestamp,
    });

    if (providedSignature !== expectedSignature) {
      console.error(
        '[verificarPorCodigoQr] 🚨 ¡¡¡ALERTA DE SEGURIDAD - INTENTO DE FRAUDE DETECTADO!!!',
      );
      console.error('  ⚠️  Firma inválida o código QR modificado');
      console.error('  📋 Certificado ID:', certificado.id);
      console.error('  📋 Número certificado:', certificado.numeroCertificado);
      console.error('  🔢 Código QR:', codigoQr);
      console.error('  👤 Usuario que emitió:', certificado.revision.usuarioId);
      console.error('  🏢 Planta:', certificado.revision.planta.nombre);
      console.error('  🔐 Firma proporcionada:', providedSignature);
      console.error('  🔐 Firma esperada:', expectedSignature);
      console.error('  ⏰ Timestamp del intento:', new Date().toISOString());
      console.error('  📍 IP (si disponible): [TODO: agregar desde request]');

      throw new UnauthorizedException(
        'Código QR inválido o ha sido modificado. Este incidente ha sido registrado y será investigado.',
      );
    }

    console.log('[verificarPorCodigoQr] ✅ Firma criptográfica válida');

    // 🔒 VALIDACIÓN 2: Verificar vigencia del certificado
    const validityCheck = this.validateCertificateValidity(certificado);
    if (!validityCheck.valid) {
      console.warn(
        '[verificarPorCodigoQr] ⚠️  Certificado no vigente:',
        validityCheck.reason,
      );
      return {
        valido: false,
        razon: validityCheck.reason,
        certificado: {
          numero: certificado.numeroCertificado,
          fechaEmision: certificado.fechaEmision,
          fechaVencimiento: certificado.fechaVencimiento,
        },
      };
    }

    console.log('[verificarPorCodigoQr] ✅ Certificado vigente y autenticado');

    const { dominio, marca, modelo, anio } = certificado.revision.vehiculo;

    return {
      valido: true,
      certificado: {
        numero: certificado.numeroCertificado,
        fechaEmision: certificado.fechaEmision,
        fechaVencimiento: certificado.fechaVencimiento,
      },
      vehiculo: { dominio, marca, modelo, anio },
      revision: {
        fecha: certificado.revision.fechaRevision,
        resultado: certificado.revision.resultado,
        planta: certificado.revision.planta.nombre,
        provincia: certificado.revision.planta.camara.provincia,
      },
      oblea: { numero: certificado.revision.oblea.numero },
    };
  }

  async findAll(camaraId: number) {
    return this.certificadosRepository.find({
      where: { revision: { planta: { camaraId } } },
      relations: ['revision', 'revision.vehiculo', 'revision.oblea'],
      order: { fechaEmision: 'DESC' },
    });
  }
}
