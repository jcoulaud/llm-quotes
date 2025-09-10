import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersAddDeletedAndLastSeen1757611000000 implements MigrationInterface {
  name = 'AlterUsersAddDeletedAndLastSeen1757611000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "lastSeenAt",
      DROP COLUMN IF EXISTS "deletedAt"
    `);
  }
}

