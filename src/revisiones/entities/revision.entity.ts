import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResultadoRevision } from '../../common/enums';
import { Planta } from '../../plantas/entities/planta.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { User } from '../../users/user.entity';
import { Oblea } from '../../obleas/entities/oblea.entity';

/**
 * Entidad Revisión Técnica
 * Representa una revisión realizada a un vehículo
 */
@Entity('revisiones')
export class Revision {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  plantaId: number;

  @Column()
  vehiculoId: number;

  @Column({ nullable: true })
  oleaId: number;

  @Column()
  usuarioId: number;

  @Column({
    type: 'enum',
    enum: ResultadoRevision,
  })
  resultado: ResultadoRevision;

  @Column({ type: 'timestamp' })
  fechaRevision: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaVencimiento: Date | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  urlFoto: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  kilometraje: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Planta)
  @JoinColumn({ name: 'plantaId' })
  planta: Planta;

  @ManyToOne(() => Vehiculo)
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo: Vehiculo;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @ManyToOne(() => Oblea, { nullable: true })
  @JoinColumn({ name: 'oleaId' })
  oblea: Oblea;
}
