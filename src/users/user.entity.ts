import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { Camara } from '../camaras/entities/camara.entity';
import { Planta } from '../plantas/entities/planta.entity';
import { Municipio } from '../municipios/entities/municipio.entity';

/**
 * Entidad Usuario
 * Representa usuarios del sistema con roles específicos
 */
@Entity('users')
@Index(['username'])
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  camaraId: number;

  @Column({ nullable: true })
  plantaId: number;

  @Column({ nullable: true })
  municipioId: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 200, nullable: true })
  nombre: string;

  @Column({ type: 'text' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Camara, { nullable: true })
  @JoinColumn({ name: 'camaraId' })
  camara: Camara;

  @ManyToOne(() => Planta, { nullable: true })
  @JoinColumn({ name: 'plantaId' })
  planta: Planta;

  @ManyToOne(() => Municipio, { nullable: true })
  @JoinColumn({ name: 'municipioId' })
  municipio: Municipio;
}
