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
import { Municipio } from '../../municipios/entities/municipio.entity';

/**
 * Entidad Planta de Revisión Técnica
 * Representa una planta habilitada para realizar revisiones
 */
@Entity('plantas')
export class Planta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  camaraId: number;

  @Column()
  municipioId: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 15, nullable: true })
  cuit: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 100, unique: true })
  codigoHabilitacion: string;

  @Column({ length: 100, nullable: true })
  telefono: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Camara, 'plantas')
  @JoinColumn({ name: 'camaraId' })
  camara: Camara;

  @ManyToOne(() => Municipio)
  @JoinColumn({ name: 'municipioId' })
  municipio: Municipio;
}
