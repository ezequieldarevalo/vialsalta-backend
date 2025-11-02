import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Planta } from '../../plantas/entities/planta.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  plantaId: number;

  @ManyToOne(() => Planta)
  @JoinColumn({ name: 'plantaId' })
  planta: Planta;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
  })
  billingPeriod: BillingPeriod;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Precio en USD

  @Column({ nullable: true })
  mercadopagoSubscriptionId: string; // ID de suscripción en MercadoPago

  @Column({ nullable: true })
  mercadopagoCustomerId: string; // ID del customer en MercadoPago

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  trialEnd: Date; // Fin del período de prueba (opcional)

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ default: true })
  autoRenew: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
