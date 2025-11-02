import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterPlantaPublicDto } from './dto/register-planta-public.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /**
   * Registro público de plantas (self-service)
   * No requiere autenticación
   */
  @Public()
  @Post('register-planta')
  registerPlanta(@Body() dto: RegisterPlantaPublicDto) {
    return this.auth.registerPlantaPublic(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  me(@Req() req: any) {
    // req.user viene del JwtStrategy.validate (payload)
    return req.user;
  }
}
