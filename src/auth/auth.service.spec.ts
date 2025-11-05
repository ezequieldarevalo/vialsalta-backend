import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PlantasService } from '../plantas/plantas.service';
import { BloquesService } from '../bloques/bloques.service';
import { PaymentsService } from '../payments/payments.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../common/enums/user-role.enum';
import { BillingPeriod } from '../payments/entities/subscription.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    createUser: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockPlantasService = {
    create: jest.fn(),
  };

  const mockBloquesService = {};

  const mockPaymentsService = {
    createSubscriptionPreference: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PlantasService,
          useValue: mockPlantasService,
        },
        {
          provide: BloquesService,
          useValue: mockBloquesService,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario y retornar JWT', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        role: UserRole.PLANTA_ADMIN,
        plantaId: 1,
        camaraId: 1,
      };

      const mockUser = {
        id: 1,
        email: registerDto.email,
        username: registerDto.username,
        role: registerDto.role,
        plantaId: registerDto.plantaId,
        camaraId: registerDto.camaraId,
        createdAt: new Date(),
      };

      const mockToken = 'jwt-token-12345';

      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
      );
    });
  });

  describe('login', () => {
    it('debería autenticar usuario con credenciales válidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        username: 'testuser',
        role: UserRole.PLANTA_ADMIN,
        plantaId: 1,
        camaraId: 1,
        activo: true,
        createdAt: new Date(),
      };

      const mockToken = 'jwt-token-12345';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        loginDto.password,
      );
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      const loginDto = {
        email: 'noexiste@example.com',
        password: 'Password123!',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('debería lanzar UnauthorizedException si el usuario está inactivo', async () => {
      const loginDto = {
        email: 'inactive@example.com',
        password: 'Password123!',
      };

      const inactiveUser = {
        id: 1,
        email: loginDto.email,
        activo: false,
      };

      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow('User is inactive');
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        activo: true,
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('registerPlantaPublic', () => {
    it('debería registrar una nueva planta con usuario y preferencia de pago', async () => {
      const registerDto = {
        nombrePlanta: 'Planta Test',
        cuit: '20-12345678-9',
        direccion: 'Calle Test 123',
        telefono: '123456789',
        email: 'planta@test.com',
        password: 'Password123!',
        camaraId: 1,
        billingPeriod: BillingPeriod.MONTHLY,
      };

      const mockPlanta = {
        id: 1,
        nombre: registerDto.nombrePlanta,
        cuit: registerDto.cuit,
        direccion: registerDto.direccion,
      };

      const mockUser = {
        id: 1,
        email: registerDto.email,
        username: registerDto.email,
        role: UserRole.PLANTA_ADMIN,
        plantaId: mockPlanta.id,
      };

      const mockPaymentPreference = {
        preferenceId: 'pref-123',
        initPoint: 'https://mercadopago.com/checkout/pref-123',
        subscriptionId: 1,
      };

      mockPlantasService.create.mockResolvedValue(mockPlanta);
      mockUsersService.createUser.mockResolvedValue(mockUser);
      mockPaymentsService.createSubscriptionPreference.mockResolvedValue(
        mockPaymentPreference,
      );

      const result = await service.registerPlantaPublic(registerDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('planta');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('payment');
      expect(result.payment.initPoint).toBe(mockPaymentPreference.initPoint);
      expect(mockPlantasService.create).toHaveBeenCalled();
      expect(mockUsersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          role: UserRole.PLANTA_ADMIN,
          plantaId: mockPlanta.id,
        }),
      );
      expect(
        mockPaymentsService.createSubscriptionPreference,
      ).toHaveBeenCalledWith(mockPlanta.id, registerDto.billingPeriod);
    });
  });

  describe('JWT Token Generation', () => {
    it('debería generar un token JWT con los claims correctos', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.CAMARA,
        camaraId: 1,
        plantaId: null,
        municipioId: null,
        activo: true,
        createdAt: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('token');

      await service.login({
        email: mockUser.email,
        password: 'password',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        camaraId: mockUser.camaraId,
        plantaId: mockUser.plantaId,
        municipioId: mockUser.municipioId,
      });
    });
  });
});
