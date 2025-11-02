import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createUser(params: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    camaraId?: number;
    plantaId?: number;
    municipioId?: number;
    // isAdminPlanta?: boolean;
  }): Promise<User> {
    const {
      username,
      email,
      password,
      role,
      camaraId,
      plantaId,
      municipioId,
      // isAdminPlanta,
    } = params;

    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = passwordHash;

    newUser.role = role;
    if (camaraId) newUser.camaraId = camaraId;
    if (plantaId) newUser.plantaId = plantaId;
    if (municipioId) newUser.municipioId = municipioId;
    // newUser.isAdminPlanta = !!isAdminPlanta;
    newUser.activo = true;

    return await this.repo.save(newUser);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
