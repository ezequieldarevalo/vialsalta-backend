import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.users.findUnique({ where: { username } });
  }

  async findById(id: number) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  async createUser(params: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    camaraId?: number;
    plantaId?: number;
    municipioId?: number;
  }) {
    const { username, email, password, role, camaraId, plantaId, municipioId } =
      params;

    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return await this.prisma.users.create({
      data: {
        username,
        email,
        password: passwordHash,
        role,
        camaraId: camaraId || null,
        plantaId: plantaId || null,
        municipioId: municipioId || null,
        activo: true,
      },
    });
  }

  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async findAll() {
    return this.prisma.users.findMany();
  }

  async updateUser(id: number, dto: any) {
    const user = await this.findById(id);
    if (!user) throw new BadRequestException('User not found');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.users.update({
      where: { id },
      data: dto,
    });
  }
}
