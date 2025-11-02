import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { BillingPeriod } from '../../payments/entities/subscription.entity';

export class RegisterPlantaPublicDto {
  @IsString()
  @MinLength(3)
  nombrePlanta: string;

  @IsString()
  @MinLength(11)
  cuit: string;

  @IsString()
  direccion: string;

  @IsString()
  telefono: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  camaraId: number; // Qué provincia/cámara

  @IsEnum(BillingPeriod)
  @IsOptional()
  billingPeriod?: BillingPeriod;
}
