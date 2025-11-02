import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { CertificadosService } from './certificados.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * Controlador de Certificados
 * Gestiona la generación y descarga de certificados PDF
 */
@Controller('certificados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  /**
   * Genera y descarga el PDF del certificado de una revisión
   */
  @Get('revision/:id/pdf')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.MUNICIPIO)
  async descargarPDF(
    @Param('id', ParseIntPipe) revisionId: number,
    @Res() res: Response,
  ) {
    console.log('🔍 Generando PDF para revisión:', revisionId);
    const pdfBuffer = await this.certificadosService.generarPDF(revisionId);
    console.log('📄 PDF generado, tamaño:', pdfBuffer.length, 'bytes');
    console.log(
      '📄 Tipo de dato:',
      typeof pdfBuffer,
      Buffer.isBuffer(pdfBuffer),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificado-revision-${revisionId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Lista todos los certificados de la cámara del usuario
   */
  @Get()
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.MUNICIPIO)
  async findAll(@Req() req: any) {
    return this.certificadosService.findAll(req.user.camaraId);
  }

  /**
   * Genera el certificado para una revisión (sin descargar PDF)
   */
  @Post('revision/:id')
  @Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.MUNICIPIO)
  async generarCertificado(@Param('id', ParseIntPipe) revisionId: number) {
    return this.certificadosService.generarCertificado(revisionId);
  }
}
