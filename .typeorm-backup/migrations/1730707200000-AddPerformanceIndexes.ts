import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1730707200000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1730707200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Índices para Certificados (búsquedas por QR y verificación)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_certificado_codigo_qr" 
      ON "certificado" ("codigoQr")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_certificado_numero" 
      ON "certificado" ("numeroCertificado")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_certificado_fecha_emision" 
      ON "certificado" ("fechaEmision")
    `);

    // 2. Índices para Revisiones (búsquedas frecuentes)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_revision_fecha" 
      ON "revision" ("fechaRevision")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_revision_resultado" 
      ON "revision" ("resultado")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_revision_planta_fecha" 
      ON "revision" ("plantaId", "fechaRevision" DESC)
    `);

    // 3. Índices para Vehículos (búsqueda por patente)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vehiculo_patente" 
      ON "vehiculo" ("patente")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_vehiculo_patente_trgm" 
      ON "vehiculo" USING gin ("patente" gin_trgm_ops)
    `);

    // 4. Índices para Obleas (búsqueda por número y estado)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_oblea_numero" 
      ON "oblea" ("numero")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_oblea_estado" 
      ON "oblea" ("estado")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_oblea_codigo_qr" 
      ON "oblea" ("codigoQr")
    `);

    // 5. Índices para Pagos (listados y búsquedas)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_status" 
      ON "payment" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_created_at" 
      ON "payment" ("createdAt" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subscription_status" 
      ON "subscription" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_subscription_planta" 
      ON "subscription" ("plantaId", "status")
    `);

    // 6. Índices para Users (login)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_email" 
      ON "user" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_role" 
      ON "user" ("role")
    `);

    // 7. Extensión pg_trgm para búsquedas difusas (si no existe)
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm
    `);

    console.log('✅ Performance indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_certificado_codigo_qr"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_certificado_numero"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_certificado_fecha_emision"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revision_fecha"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revision_resultado"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_revision_planta_fecha"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vehiculo_patente"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_vehiculo_patente_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oblea_numero"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oblea_estado"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_oblea_codigo_qr"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscription_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscription_planta"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_role"`);

    console.log('✅ Performance indexes dropped successfully');
  }
}
