import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly emailEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // Solo configurar email si las credenciales están presentes
    this.emailEnabled =
      !!this.configService.get('EMAIL_HOST') &&
      !!this.configService.get('EMAIL_USER');

    if (this.emailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST'),
        port: this.configService.get<number>('EMAIL_PORT', 587),
        secure: this.configService.get<boolean>('EMAIL_SECURE', false), // true para 465, false para otros
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASSWORD'),
        },
      });

      this.logger.log('✉️  Email service initialized');
    } else {
      this.logger.warn(
        '⚠️  Email service disabled - Missing EMAIL_HOST or EMAIL_USER in .env',
      );
    }
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.emailEnabled) {
      this.logger.warn(
        `Email not sent (service disabled): ${options.subject} to ${options.to}`,
      );
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Sistema de Obleas" <${this.configService.get('EMAIL_USER')}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`✅ Email sent: ${options.subject} to ${options.to}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${options.subject} to ${options.to}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Email de bienvenida al registrarse
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido al Sistema de Obleas!</h1>
            </div>
            <div class="content">
              <h2>Hola ${name},</h2>
              <p>Tu cuenta ha sido creada exitosamente en el Sistema de Obleas de Revisión Técnica Vehicular.</p>
              <p>Ahora puedes acceder al sistema y comenzar a gestionar tus revisiones técnicas.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/login" class="button">
                  Iniciar Sesión
                </a>
              </p>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>Este es un email automático, por favor no responder.</p>
              <p>&copy; 2025 Sistema de Obleas - Todos los derechos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '¡Bienvenido al Sistema de Obleas!',
      html,
      text: `Hola ${name},\n\nTu cuenta ha sido creada exitosamente.\n\nAccede en: ${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/login`,
    });
  }

  /**
   * Email de confirmación de pago
   */
  async sendPaymentConfirmation(
    email: string,
    bloqueId: number,
    cantidad: number,
    monto: number,
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .detail { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .total { font-size: 24px; font-weight: bold; color: #2196F3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pago Confirmado</h1>
            </div>
            <div class="content">
              <h2>¡Tu pago ha sido procesado exitosamente!</h2>
              <div class="detail">
                <p><strong>Bloque de Obleas:</strong> #${bloqueId}</p>
                <p><strong>Cantidad de Obleas:</strong> ${cantidad}</p>
                <p><strong>Monto Total:</strong> <span class="total">$${monto.toLocaleString('es-AR')}</span></p>
              </div>
              <p>Las obleas ya están disponibles para su uso en tu planta.</p>
              <p>Puedes verificar el estado en el panel de administración.</p>
            </div>
            <div class="footer">
              <p>Este es un email automático, por favor no responder.</p>
              <p>&copy; 2025 Sistema de Obleas</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Pago Confirmado - Bloque #${bloqueId}`,
      html,
      text: `Pago confirmado!\n\nBloque: #${bloqueId}\nCantidad: ${cantidad} obleas\nMonto: $${monto}`,
    });
  }

  /**
   * Email de alerta de vencimiento de certificado
   */
  async sendCertificateExpirationAlert(
    email: string,
    patente: string,
    fechaVencimiento: Date,
  ): Promise<boolean> {
    const diasRestantes = Math.ceil(
      (fechaVencimiento.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .alert { background: #FFF3CD; border: 1px solid #FFD700; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .days { font-size: 48px; font-weight: bold; color: #FF9800; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Certificado por Vencer</h1>
            </div>
            <div class="content">
              <div class="alert">
                <p><strong>Vehículo:</strong> ${patente}</p>
                <p><strong>Fecha de Vencimiento:</strong> ${fechaVencimiento.toLocaleDateString('es-AR')}</p>
                <div class="days">${diasRestantes}</div>
                <p style="text-align: center;">días restantes</p>
              </div>
              <p>Le recordamos que debe realizar la revisión técnica vehicular antes del vencimiento.</p>
              <p>Evite multas y garantice la seguridad de su vehículo.</p>
            </div>
            <div class="footer">
              <p>Este es un email automático, por favor no responder.</p>
              <p>&copy; 2025 Sistema de Obleas</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `⚠️ Certificado de ${patente} vence en ${diasRestantes} días`,
      html,
      text: `ALERTA: El certificado del vehículo ${patente} vence el ${fechaVencimiento.toLocaleDateString('es-AR')} (en ${diasRestantes} días)`,
    });
  }
}
