import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuotesTable1736550000000 implements MigrationInterface {
  name = 'CreateQuotesTable1736550000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quotes" (
        "id" SERIAL NOT NULL,
        "content" text NOT NULL,
        "llmSource" character varying(50) NOT NULL,
        "twitterHandle" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "slug" character varying NOT NULL,
        "scheduledFor" TIMESTAMP,
        "tweetId" character varying,
        "views" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "postedAt" TIMESTAMP,
        CONSTRAINT "PK_quotes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_quotes_slug" ON "quotes" ("slug")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_quotes_slug"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quotes"`);
  }
}

