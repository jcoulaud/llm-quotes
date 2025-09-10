import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavoritesTable1757605000000 implements MigrationInterface {
  name = 'CreateFavoritesTable1757605000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" SERIAL NOT NULL,
        "userId" character varying NOT NULL,
        "quoteId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_favorites_quoteId_quotes_id" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_favorites_userId" ON "favorites" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_favorites_quoteId" ON "favorites" ("quoteId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_favorites_user_quote" ON "favorites" ("userId", "quoteId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_favorites_user_quote"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_favorites_quoteId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_favorites_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "favorites"`);
  }
}

