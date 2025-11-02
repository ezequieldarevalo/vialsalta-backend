import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PlantasService } from '../plantas/plantas.service';
import { BloquesService } from '../bloques/bloques.service';
import { PaymentsService } from '../payments/payments.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterPlantaPublicDto } from './dto/register-planta-public.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { BillingPeriod } from '../payments/entities/subscription.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly plantas: PlantasService,
    private readonly bloques: BloquesService,
    private readonly payments: PaymentsService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.createUser(dto);
    const access_token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      camaraId: user.camaraId || null,
      plantaId: user.plantaId || null,
      municipioId: user.municipioId || null,
    });
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        camaraId: user.camaraId,
        plantaId: user.plantaId,
        municipioId: user.municipioId,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.activo) throw new UnauthorizedException('User is inactive');

    const ok = await this.users.validatePassword(user, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      camaraId: user.camaraId || null,
      plantaId: user.plantaId || null,
      municipioId: user.municipioId || null,
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        camaraId: user.camaraId,
        plantaId: user.plantaId,
        municipioId: user.municipioId,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Registro público de plantas (self-service)
   * Este endpoint crea:
   * 1. La planta
   * 2. El usuario admin de la planta
   * 3. Un bloque inicial de 100 obleas
   * 4. La preferencia de pago en MercadoPago
   */
  async registerPlantaPublic(dto: RegisterPlantaPublicDto) {
    // 1. Crear la planta
    const planta = await this.plantas.create({
      nombre: dto.nombrePlanta,
      cuit: dto.cuit,
      direccion: dto.direccion,
      telefono: dto.telefono,
      email: dto.email,
      camaraId: dto.camaraId,
    });

    // 2. Crear usuario admin de la planta
    const user = await this.users.createUser({
      email: dto.email,
      username: dto.email,
      password: dto.password,
      role: UserRole.PLANTA,
      plantaId: planta.id,
      camaraId: dto.camaraId,
    });

    // 3. Crear preferencia de pago en MercadoPago
    const paymentPreference = await this.payments.createSubscriptionPreference(
      planta.id,
      dto.billingPeriod || BillingPeriod.MONTHLY,
    );

    // 4. Devolver info para redirigir al pago
    return {
      message:
        'Planta registrada exitosamente. Completá el pago para activar tu cuenta.',
      planta: {
        id: planta.id,
        nombre: planta.nombre,
        cuit: planta.cuit,
      },
      user: {
        id: user.id,
        email: user.email,
      },
      payment: {
        preferenceId: paymentPreference.preferenceId,
        initPoint: paymentPreference.initPoint,
        subscriptionId: paymentPreference.subscriptionId,
      },
    };
  }
}
