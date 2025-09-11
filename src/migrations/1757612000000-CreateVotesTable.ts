import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVotesTable1757612000000 implements MigrationInterface {
  name = 'CreateVotesTable1757612000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "votes" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "quoteId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_votes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_votes_quoteId_quotes_id" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_votes_userId_users_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_votes_userId" ON "votes" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_votes_quoteId" ON "votes" ("quoteId")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_votes_user_quote" ON "votes" ("userId", "quoteId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_votes_user_quote"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_votes_quoteId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_votes_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "votes"`);
  }
}

