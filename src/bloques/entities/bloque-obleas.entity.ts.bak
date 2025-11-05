import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EstadoBloque } from '../../common/enums';
import { Camara } from '../../camaras/entities/camara.entity';
import { Planta } from '../../plantas/entities/planta.entity';
import { Oblea } from '../../obleas/entities/oblea.entity';

/**
 * Entidad Bloque de Obleas
 * Representa un rango de obleas creado por la cámara
 */
@Entity('bloques_obleas')
export class BloqueObleas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string;

  @Column({ nullable: true })
  camaraId: number;

  @Column({ nullable: true })
  plantaId: number;

  @Column({ type: 'int' })
  numeroInicio: number;

  @Column({ type: 'int' })
  numeroFin: number;

  @Column({ type: 'int' })
  cantidadTotal: number;

  @Column({
    type: 'enum',
    enum: EstadoBloque,
    default: EstadoBloque.CREADO,
  })
  estado: EstadoBloque;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaAsignacion: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Camara, { nullable: true })
  @JoinColumn({ name: 'camaraId' })
  camara: Camara;

  @ManyToOne(() => Planta, { nullable: true })
  @JoinColumn({ name: 'plantaId' })
  planta: Planta;

  @OneToMany(() => Oblea, (oblea) => oblea.bloque)
  obleas: Oblea[];
}
