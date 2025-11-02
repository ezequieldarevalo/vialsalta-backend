import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { TipoVehiculo, TipoCombustible } from '../../common/enums';
import { Revision } from '../../revisiones/entities/revision.entity';

/**
 * Entidad Vehículo
 * Representa un vehículo que puede ser inspeccionado
 */
@Entity('vehiculos')
@Index(['dominio'], { unique: true })
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
    enum: TipoVehiculo,
  })
  tipo: TipoVehiculo;

  @Column({
    type: 'enum',
    enum: TipoCombustible,
  })
  combustible: TipoCombustible;

  @Column({ length: 100, nullable: true })
  numeroMotor: string;

  @Column({ length: 100, nullable: true })
  numeroChasis: string;

  // Relación con revisiones
  @OneToMany(() => Revision, (revision) => revision.vehiculo)
  revisiones: Revision[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
