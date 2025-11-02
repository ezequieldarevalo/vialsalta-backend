import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MercadoPagoConfig,
  Preference,
  Payment as MPPayment,
} from 'mercadopago';
import {
  Subscription,
  SubscriptionStatus,
  BillingPeriod,
} from './entities/subscription.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Planta } from '../plantas/entities/planta.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mercadopago: MercadoPagoConfig;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Planta)
    private plantaRepository: Repository<Planta>,
  ) {
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
    const planta = await this.plantaRepository.findOne({
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
    const subscription = this.subscriptionRepository.create({
      plantaId,
      status: SubscriptionStatus.PENDING,
      billingPeriod,
      amount,
      autoRenew: true,
    });
    await this.subscriptionRepository.save(subscription);

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

      const subscription = await this.subscriptionRepository.findOne({
        where: { id: subscriptionId },
        relations: ['planta'],
      });

      if (!subscription) {
        this.logger.error(`Suscripción ${subscriptionId} no encontrada`);
        return;
      }

      // Registrar el pago
      const payment = this.paymentRepository.create({
        subscriptionId: subscription.id,
        mercadopagoPaymentId: paymentId,
        status:
          paymentInfo.status === 'approved'
            ? PaymentStatus.APPROVED
            : paymentInfo.status === 'rejected'
              ? PaymentStatus.REJECTED
              : PaymentStatus.PENDING,
        amount: paymentInfo.transaction_amount,
        currency: paymentInfo.currency_id,
        paymentMethod: paymentInfo.payment_method_id,
        paidAt: paymentInfo.status === 'approved' ? new Date() : undefined,
        metadata: paymentInfo,
      });
      await this.paymentRepository.save(payment);

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
  private async activateSubscription(subscription: Subscription) {
    const now = new Date();
    const periodEnd = new Date(now);

    if (subscription.billingPeriod === BillingPeriod.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = periodEnd;

    await this.subscriptionRepository.save(subscription);

    this.logger.log(
      `Suscripción ${subscription.id} activada hasta ${periodEnd.toISOString()}`,
    );

    // TODO: Enviar email de bienvenida
  }

  /**
   * Verificar si una planta tiene suscripción activa
   */
  async isSubscriptionActive(plantaId: number): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        plantaId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      return false;
    }

    // Verificar si no expiró
    const now = new Date();
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < now) {
      // Suscripción expirada
      subscription.status = SubscriptionStatus.SUSPENDED;
      await this.subscriptionRepository.save(subscription);
      return false;
    }

    return true;
  }

  /**
   * Obtener suscripción activa de una planta
   */
  async getActiveSubscription(plantaId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: {
        plantaId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['planta'],
    });
  }

  /**
   * Suspender suscripción por falta de pago
   */
  async suspendSubscription(subscriptionId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.SUSPENDED;
      await this.subscriptionRepository.save(subscription);
      this.logger.warn(`Suscripción ${subscriptionId} suspendida`);
    }
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(subscriptionId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      subscription.autoRenew = false;
      await this.subscriptionRepository.save(subscription);
      this.logger.log(`Suscripción ${subscriptionId} cancelada`);
    }
  }

  /**
   * Obtener historial de pagos de una planta
   */
  async getPaymentHistory(plantaId: number): Promise<Payment[]> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { plantaId },
    });

    if (!subscription) {
      return [];
    }

    return this.paymentRepository.find({
      where: { subscriptionId: subscription.id },
      order: { createdAt: 'DESC' },
    });
  }
}
