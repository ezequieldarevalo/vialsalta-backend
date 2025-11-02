import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BillingPeriod } from './entities/subscription.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Crear preferencia de pago para nueva suscripción
   * Endpoint público (para landing page de registro)
   */
  @Post('create-preference')
  async createPreference(
    @Body()
    body: {
      plantaId: number;
      billingPeriod?: BillingPeriod;
    },
  ) {
    return this.paymentsService.createSubscriptionPreference(
      body.plantaId,
      body.billingPeriod || BillingPeriod.MONTHLY,
    );
  }

  /**
   * Webhook de MercadoPago
   * MercadoPago envía notificaciones aquí cuando hay un pago
   */
  @Post('webhook')
  async webhook(@Body() body: any, @Query() query: any) {
    // MercadoPago puede enviar data en body o query
    const data = body || query;
    await this.paymentsService.processWebhook(data);
    return { status: 'ok' };
  }

  /**
   * Verificar si la planta tiene suscripción activa
   */
  @UseGuards(JwtAuthGuard)
  @Get('subscription/status')
  async getSubscriptionStatus(@Request() req) {
    const plantaId = req.user.plantaId;

    if (!plantaId) {
      return { active: false, message: 'Usuario sin planta asociada' };
    }

    const isActive = await this.paymentsService.isSubscriptionActive(plantaId);
    const subscription =
      await this.paymentsService.getActiveSubscription(plantaId);

    return {
      active: isActive,
      subscription,
    };
  }

  /**
   * Obtener historial de pagos
   */
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getPaymentHistory(@Request() req) {
    const plantaId = req.user.plantaId;

    if (!plantaId) {
      return [];
    }

    return this.paymentsService.getPaymentHistory(plantaId);
  }

  /**
   * Cancelar suscripción
   */
  @UseGuards(JwtAuthGuard)
  @Post('subscription/:id/cancel')
  async cancelSubscription(@Param('id') id: number, @Request() req) {
    // TODO: Verificar que la suscripción pertenece al usuario
    await this.paymentsService.cancelSubscription(id);
    return { message: 'Suscripción cancelada exitosamente' };
  }
}
