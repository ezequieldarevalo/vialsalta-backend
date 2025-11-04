import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Revision } from '../../revisiones/entities/revision.entity';
import { Oblea } from '../../obleas/entities/oblea.entity';

/**
 * Entidad Certificado
 * Representa el certificado digital generado por una revisión aprobada
 */
@Entity('certificados')
@Index(['numeroCertificado'], { unique: true })
@Index(['codigoQr'], { unique: true })
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  revisionId: number;

  @Column({ unique: true })
  oleaId: number;

  @Column({ length: 50, unique: true })
  numeroCertificado: string;

  @Column({ type: 'text', unique: true, select: true })
  codigoQr: string;

  @Column({ type: 'text', nullable: true })
  urlPdf: string;

  @Column({ type: 'text', nullable: true })
  urlVerificacion: string;

  @Column({ type: 'timestamp' })
  fechaEmision: Date;

  @Column({ type: 'timestamp' })
  fechaVencimiento: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToOne(() => Revision)
  @JoinColumn({ name: 'revisionId' })
  revision: Revision;

  @OneToOne(() => Oblea)
  @JoinColumn({ name: 'oleaId' })
  oblea: Oblea;
}
