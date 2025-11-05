import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Health check básico para monitoreo externo (UptimeRobot)
   */
  async checkHealth() {
    try {
      // Verificar conexión a DB
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Health check detallado para debugging y dashboards
   */
  async checkHealthDetailed() {
    const startTime = Date.now();
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      checks: {},
    };

    // 1. Check Database
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const dbTime = Date.now() - dbStart;

      health.checks.database = {
        status: 'ok',
        responseTime: `${dbTime}ms`,
        connected: true,
      };
    } catch (error) {
      health.status = 'degraded';
      health.checks.database = {
        status: 'error',
        error: error.message,
      };
    }

    // 2. Check Memory
    const memUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    health.checks.memory = {
      status: heapUsedPercent > 90 ? 'warning' : 'ok',
      usage: memoryMB,
      heapUsedPercent: Math.round(heapUsedPercent),
    };

    if (heapUsedPercent > 90) {
      health.status = 'degraded';
    }

    // 3. Check Disk Space (si queremos)
    // Requiere librería adicional, por ahora omitir

    // 4. Response Time
    health.responseTime = `${Date.now() - startTime}ms`;

    // 5. Versión de Node
    health.node = process.version;

    return health;
  }
}
