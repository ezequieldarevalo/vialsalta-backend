import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Camara } from '../../camaras/entities/camara.entity';

/**
 * Entidad Municipio
 * Representa una municipalidad que recibe porcentaje de reparto
 */
@Entity('municipios')
export class Municipio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  camaraId: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  porcentajeReparto: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Camara, 'municipios')
  @JoinColumn({ name: 'camaraId' })
  camara: Camara;
}
