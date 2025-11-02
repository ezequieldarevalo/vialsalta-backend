import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Entidad Cámara Provincial de RTV
 * Representa la entidad que administra el sistema de obleas
 */
@Entity('camaras')
export class Camara {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 100 })
  provincia: string;

  @Column({ length: 10, unique: true })
  codigo: string; // SAL, CBA, TUC, etc.

  @Column({ type: 'int' })
  rangoInicio: number; // Ej: 1000000 para Salta

  @Column({ type: 'int' })
  rangoFin: number; // Ej: 1999999 para Salta

  @Column({ length: 20, unique: true })
  cuit: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

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

  // Relaciones (lazy loading para evitar referencias circulares)
  @OneToMany('Planta', 'camara')
  plantas: any[];

  @OneToMany('Municipio', 'camara')
  municipios: any[];

  @OneToMany('BloqueObleas', 'camara')
  bloques: any[];
}
