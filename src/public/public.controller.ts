import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CertificadosService } from '../certificados/certificados.service';

@Controller('public')
export class PublicController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  /**
   * Verifica un certificado por código QR
   * Endpoint público - no requiere autenticación
   */
  @Public()
  @Get('verificar/:codigoQr')
  async verificarCertificado(@Param('codigoQr') codigoQr: string) {
    return this.certificadosService.verificarPorCodigoQr(codigoQr);
  }
}
