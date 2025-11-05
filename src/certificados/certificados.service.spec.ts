import { Test, TestingModule } from '@nestjs/testing';
import { CertificadosService } from './certificados.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('CertificadosService', () => {
  let service: CertificadosService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    service = module.get<CertificadosService>(CertificadosService);
    prisma = module.get(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería retornar todos los certificados de una cámara', async () => {
      const mockCertificados = [
        {
          id: 1,
          numeroCertificado: 'CERT-001',
          fechaEmision: new Date(),
          revisionId: 1,
          codigoQr: 'QR-001',
          revisiones: {
            vehiculos: { dominio: 'ABC123' },
            obleas: { numero: 1000000 },
          },
        },
        {
          id: 2,
          numeroCertificado: 'CERT-002',
          fechaEmision: new Date(),
          revisionId: 2,
          codigoQr: 'QR-002',
          revisiones: {
            vehiculos: { dominio: 'XYZ789' },
            obleas: { numero: 1000001 },
          },
        },
      ];

      prisma.certificados.findMany.mockResolvedValue(mockCertificados as any);

      const result = await service.findAll(1);

      expect(result).toEqual(mockCertificados);
      expect(prisma.certificados.findMany).toHaveBeenCalledWith({
        where: { revisiones: { plantas: { camaraId: 1 } } },
        include: {
          revisiones: {
            include: {
              vehiculos: true,
              obleas: true,
            },
          },
        },
        orderBy: { fechaEmision: 'desc' },
      });
    });
  });

  describe('generarCertificado', () => {
    const mockRevisionConOblea = {
      id: 1,
      vehiculos: {
        id: 1,
        dominio: 'ABC123',
        marca: 'Toyota',
        modelo: 'Corolla',
      },
      plantas: {
        id: 1,
        nombre: 'Planta Test',
        camaraId: 1,
        camaras: { id: 1 },
      },
      users: { id: 1 },
      obleas: {
        id: 1,
        numero: 1000000,
        codigoQr: 'QR-1000000-1234567890-1-abcd1234',
      },
      resultado: 'APROBADO',
      fechaRevision: new Date(),
    };

    it('debería generar un certificado para revisión APTA con oblea', async () => {
      prisma.revisiones.findUnique.mockResolvedValue(
        mockRevisionConOblea as any,
      );
      prisma.certificados.findFirst.mockResolvedValue(null); // No existe certificado
      prisma.certificados.create.mockResolvedValue({
        id: 1,
        numeroCertificado: 'CERT-001',
        codigoQr: 'QR-1000000-1234567890-1-abcd1234',
        revisionId: 1,
        oleaId: null,
        urlPdf: null,
        urlVerificacion: null,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.generarCertificado(1);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('numeroCertificado');
      expect(prisma.revisiones.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          vehiculos: true,
          obleas: true,
          plantas: { include: { camaras: true } },
          users: true,
        },
      });
    });

    it('debería lanzar NotFoundException si la revisión no existe', async () => {
      prisma.revisiones.findUnique.mockResolvedValue(null);

      await expect(service.generarCertificado(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería retornar el certificado existente si ya fue generado', async () => {
      const existingCertificado = {
        id: 1,
        numeroCertificado: 'CERT-001',
        revisionId: 1,
        oleaId: null,
        codigoQr: 'QR-001',
        urlPdf: null,
        urlVerificacion: null,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.revisiones.findUnique.mockResolvedValue(
        mockRevisionConOblea as any,
      );
      prisma.certificados.findFirst.mockResolvedValue(existingCertificado);

      const result = await service.generarCertificado(1);

      expect(result).toEqual(existingCertificado);
    });

    it('debería generar certificado CONDICIONAL sin oblea', async () => {
      const mockRevisionCondicional = {
        ...mockRevisionConOblea,
        obleas: null,
        resultado: 'CONDICIONAL',
      };

      prisma.revisiones.findUnique.mockResolvedValue(
        mockRevisionCondicional as any,
      );
      prisma.certificados.findFirst.mockResolvedValue(null);
      prisma.certificados.create.mockResolvedValue({
        id: 2,
        numeroCertificado: 'CERT-002',
        revisionId: 1,
        oleaId: null,
        codigoQr: 'COND-002',
        urlPdf: null,
        urlVerificacion: null,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.generarCertificado(1);

      expect(result).toHaveProperty('id');
      expect(prisma.certificados.create).toHaveBeenCalled();
    });

    it('debería lanzar error si revisión APTA no tiene oblea', async () => {
      const mockRevisionSinOblea = {
        ...mockRevisionConOblea,
        obleas: null,
        resultado: 'APROBADO',
      };

      prisma.revisiones.findUnique.mockResolvedValue(
        mockRevisionSinOblea as any,
      );

      await expect(service.generarCertificado(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Validación de código QR', () => {
    it('debería generar códigos QR con formato válido', async () => {
      const mockRevision = {
        id: 1,
        vehiculos: {
          id: 1,
          dominio: 'ABC123',
          marca: 'Toyota',
          modelo: 'Corolla',
        },
        plantas: {
          id: 1,
          nombre: 'Planta Test',
          camaraId: 1,
          camaras: { id: 1 },
        },
        users: { id: 1 },
        obleas: {
          id: 1,
          numero: 1000000,
          codigoQr: 'QR-1000000-1234567890-1-abcd1234',
        },
        resultado: 'APROBADO',
        fechaRevision: new Date(),
      };

      prisma.revisiones.findUnique.mockResolvedValue(mockRevision as any);
      prisma.certificados.findFirst.mockResolvedValue(null);

      const savedCertificado = {
        id: 1,
        numeroCertificado: 'CERT-001',
        codigoQr: 'QR-1000000-1234567890-1-abcd1234',
        revisionId: 1,
        oleaId: null,
        urlPdf: null,
        urlVerificacion: null,
        fechaEmision: new Date(),
        fechaVencimiento: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.certificados.create.mockResolvedValue(savedCertificado);

      const certificado = await service.generarCertificado(1);

      // Verificar que el código QR tiene un formato válido
      // Puede ser QR-{numero}-{timestamp}-{id}-{signature} (16 chars)
      // o el formato de la oblea directamente
      expect(certificado.codigoQr).toBeTruthy();
      expect(certificado.codigoQr).toContain('QR-');
    });
  });
});
