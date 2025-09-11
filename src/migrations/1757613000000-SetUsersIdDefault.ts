import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetUsersIdDefault1757613000000 implements MigrationInterface {
  name = 'SetUsersIdDefault1757613000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure UUID generation function exists, then set default on users.id
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "id" DROP DEFAULT
    `);
    // Intentionally keep extension in place if it exists
  }
}
