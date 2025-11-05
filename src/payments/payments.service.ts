import { Injectable, Logger } from '@nestjs/common';
import {
  MercadoPagoConfig,
  Preference,
  Payment as MPPayment,
} from 'mercadopago';
import {
  SubscriptionStatus,
  BillingPeriod,
} from './entities/subscription.entity';
import { PaymentStatus } from './entities/payment.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mercadopago: MercadoPagoConfig;

  constructor(private readonly prisma: PrismaService) {
    // Inicializar MercadoPago
    this.mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    });
  }

  /**
   * Crear preferencia de pago para nueva suscripción
   */
  async createSubscriptionPreference(
    plantaId: number,
    billingPeriod: BillingPeriod = BillingPeriod.MONTHLY,
  ) {
    const planta = await this.prisma.plantas.findUnique({
      where: { id: plantaId },
    });

    if (!planta) {
      throw new Error('Planta no encontrada');
    }

    // Calcular precio según período
    const basePrice = 150; // $150 USD/mes
    const amount =
      billingPeriod === BillingPeriod.ANNUAL ? basePrice * 10 : basePrice; // 2 meses gratis en anual

    // Convertir a ARS (aprox)
    const exchangeRate = 1000; // $1 USD = $1000 ARS (ajustar según tipo de cambio)
    const amountARS = amount * exchangeRate;

    // Crear suscripción en BD (estado PENDING)
    const subscription = await this.prisma.subscriptions.create({
      data: {
        plantaId,
        status: SubscriptionStatus.PENDING as any,
        billingPeriod: billingPeriod as any,
        amount,
        autoRenew: true,
      },
    });

    // Crear preferencia de pago en MercadoPago
    const preference = new Preference(this.mercadopago);

    const preferenceData = {
      items: [
        {
          id: `subscription-${subscription.id}`,
          title: `Licencia Planta VTV ${planta.nombre} - ${billingPeriod === BillingPeriod.MONTHLY ? 'Mensual' : 'Anual'}`,
          description: `Sistema de Gestión de Obleas RTV - ${billingPeriod === BillingPeriod.MONTHLY ? 'Pago Mensual' : 'Pago Anual'}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: amountARS,
        },
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success?subscription_id=${subscription.id}`,
        failure: `${process.env.FRONTEND_URL}/payment/failure?subscription_id=${subscription.id}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?subscription_id=${subscription.id}`,
      },
      auto_return: 'approved' as const,
      notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
      metadata: {
        subscription_id: subscription.id,
        planta_id: plantaId,
      },
    };

    const result = await preference.create({ body: preferenceData });

    this.logger.log(
      `Preferencia de pago creada para planta ${plantaId}: ${result.id}`,
    );

    return {
      subscriptionId: subscription.id,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    };
  }

  /**
   * Procesar webhook de MercadoPago
   */
  async processWebhook(data: any) {
    this.logger.log('Webhook recibido de MercadoPago:', JSON.stringify(data));

    // MercadoPago envía notificaciones de tipo "payment"
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      await this.processPaymentNotification(paymentId);
    }
  }

  /**
   * Procesar notificación de pago
   */
  private async processPaymentNotification(paymentId: string) {
    try {
      // Obtener información del pago desde MercadoPago
      const paymentClient = new MPPayment(this.mercadopago);
      const paymentInfo = await paymentClient.get({ id: paymentId });

      this.logger.log(`Procesando pago ${paymentId}:`, paymentInfo);

      const subscriptionId = paymentInfo.metadata?.subscription_id;
      if (!subscriptionId) {
        this.logger.warn(`Pago ${paymentId} sin subscription_id en metadata`);
        return;
      }

      const subscription = await this.prisma.subscriptions.findUnique({
        where: { id: subscriptionId },
        include: { plantas: true },
      });

      if (!subscription) {
        this.logger.error(`Suscripción ${subscriptionId} no encontrada`);
        return;
      }

      // Registrar el pago
      const payment = await this.prisma.payments.create({
        data: {
          subscriptionId: subscription.id,
          mercadopagoPaymentId: paymentId,
          status:
            paymentInfo.status === 'approved'
              ? (PaymentStatus.APPROVED as any)
              : paymentInfo.status === 'rejected'
                ? (PaymentStatus.REJECTED as any)
                : (PaymentStatus.PENDING as any),
          amount: paymentInfo.transaction_amount || 0,
          currency: paymentInfo.currency_id,
          paymentMethod: paymentInfo.payment_method_id,
          paidAt: paymentInfo.status === 'approved' ? new Date() : undefined,
          metadata: paymentInfo as any,
        },
      });

      // Si el pago fue aprobado, activar suscripción
      if (paymentInfo.status === 'approved') {
        await this.activateSubscription(subscription);
      }
    } catch (error) {
      this.logger.error(`Error procesando pago ${paymentId}:`, error);
    }
  }

  /**
   * Activar suscripción después de pago aprobado
   */
  private async activateSubscription(subscription: any) {
    const now = new Date();
    const periodEnd = new Date(now);

    if (subscription.billingPeriod === BillingPeriod.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    await this.prisma.subscriptions.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.ACTIVE as any,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(
      `Suscripción ${subscription.id} activada hasta ${periodEnd.toISOString()}`,
    );

    // TODO: Enviar email de bienvenida
  }

  /**
   * Verificar si una planta tiene suscripción activa
   */
  async isSubscriptionActive(plantaId: number): Promise<boolean> {
    const subscription = await this.prisma.subscriptions.findFirst({
      where: {
        plantaId,
        status: SubscriptionStatus.ACTIVE as any,
      },
    });

    if (!subscription) {
      return false;
    }

    // Verificar si no expiró
    const now = new Date();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < now) {
      // Suscripción expirada
      await this.prisma.subscriptions.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.SUSPENDED as any },
      });
      return false;
    }

    return true;
  }

  /**
   * Obtener suscripción activa de una planta
   */
  async getActiveSubscription(plantaId: number): Promise<any | null> {
    return this.prisma.subscriptions.findFirst({
      where: {
        plantaId,
        status: SubscriptionStatus.ACTIVE as any,
      },
      include: { plantas: true },
    });
  }

  /**
   * Suspender suscripción por falta de pago
   */
  async suspendSubscription(subscriptionId: number) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (subscription) {
      await this.prisma.subscriptions.update({
        where: { id: subscriptionId },
        data: { status: SubscriptionStatus.SUSPENDED as any },
      });
      this.logger.warn(`Suscripción ${subscriptionId} suspendida`);
    }
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(subscriptionId: number) {
    const subscription = await this.prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (subscription) {
      await this.prisma.subscriptions.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED as any,
          cancelledAt: new Date(),
          autoRenew: false,
        },
      });
      this.logger.log(`Suscripción ${subscriptionId} cancelada`);
    }
  }

  /**
   * Obtener historial de pagos de una planta
   */
  async getPaymentHistory(plantaId: number): Promise<any[]> {
    const subscription = await this.prisma.subscriptions.findFirst({
      where: { plantaId },
    });

    if (!subscription) {
      return [];
    }

    return this.prisma.payments.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
