import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  TipoVehiculo as TipoVehiculoEnum,
  TipoCombustible,
} from '../../common/enums';
import { Revision } from '../../revisiones/entities/revision.entity';
import { TipoVehiculo as TipoVehiculoEntity } from '../../tipos-vehiculo/entities/tipo-vehiculo.entity';

/**
 * Entidad Vehículo
 * Representa un vehículo que puede ser inspeccionado
 */
@Entity('vehiculos')
@Index(['dominio'], { unique: true })
@Index(['numeroChasis']) // Índice para búsquedas por chasis
@Index(['numeroMotor']) // Índice para búsquedas por motor
@Index(['marca', 'modelo']) // Índice compuesto para búsquedas por marca/modelo
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  dominio: string;

  @Column({ length: 100 })
  marca: string;

  @Column({ length: 100 })
  modelo: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({
    type: 'enum',
    enum: TipoVehiculoEnum,
    nullable: true,
  })
  tipo?: TipoVehiculoEnum;

  // Relación con TipoVehiculo configurado
  @Column({ nullable: true })
  tipoVehiculoId?: number;

  @ManyToOne(() => TipoVehiculoEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'tipoVehiculoId' })
  tipoVehiculo?: TipoVehiculoEntity;

  @Column({
    type: 'enum',
    enum: TipoCombustible,
  })
  combustible: TipoCombustible;

  @Column({ length: 100, nullable: true })
  numeroMotor?: string;

  @Column({ length: 100, nullable: true })
  numeroChasis?: string;

  @Column({ type: 'date', nullable: true })
  fechaPrimeraMatriculacion?: Date;

  @Column({ type: 'text', nullable: true })
  fotoUrl?: string; // URL de la foto del vehículo (almacenada en Storage)

  // Relación con revisiones
  @OneToMany(() => Revision, (revision) => revision.vehiculo)
  revisiones: Revision[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
