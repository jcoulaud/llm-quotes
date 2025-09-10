import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

export class AddUsersAndLinkFavorites1757610000000 implements MigrationInterface {
  name = 'AddUsersAndLinkFavorites1757610000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL,
        "clerkId" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_clerkId" UNIQUE ("clerkId")
      )
    `);

    // 2) Backfill users from distinct favorites.userId (Clerk IDs)
    const rows: Array<{ userId: string } | null> = await queryRunner.query(
      `SELECT DISTINCT "userId" FROM "favorites"`
    );

    for (const row of rows as Array<{ userId: string }>) {
      const clerkId = row?.userId;
      if (!clerkId) continue;
      const id = randomUUID();
      await queryRunner.query(
        `INSERT INTO "users"("id", "clerkId") VALUES ($1, $2) ON CONFLICT ("clerkId") DO NOTHING`,
        [id, clerkId]
      );
    }

    // 3) Add temporary UUID column on favorites
    await queryRunner.query(`
      ALTER TABLE "favorites" ADD COLUMN IF NOT EXISTS "user_uuid" uuid
    `);

    // 4) Populate favorites.user_uuid from users.id via clerkId mapping
    await queryRunner.query(`
      UPDATE "favorites" f
      SET "user_uuid" = u."id"
      FROM "users" u
      WHERE u."clerkId" = f."userId"
    `);

    // 5) Drop old unique index and userId index, if present
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_favorites_user_quote"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_favorites_userId"`);

    // 6) Drop old varchar userId column
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP COLUMN IF EXISTS "userId"
    `);

    // 7) Rename user_uuid -> userId (now UUID semantics)
    await queryRunner.query(`
      ALTER TABLE "favorites" RENAME COLUMN "user_uuid" TO "userId"
    `);

    // 8) Add index and FK for new userId (UUID)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_favorites_userId" ON "favorites" ("userId")
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD CONSTRAINT "FK_favorites_userId_users_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // 9) Recreate composite unique index with new UUID userId
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_favorites_user_quote" ON "favorites" ("userId", "quoteId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Best-effort rollback: remove FK + UUID userId, restore varchar userId from users.clerkId
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_favorites_user_quote"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "FK_favorites_userId_users_id"
    `);

    // Add back old varchar column
    await queryRunner.query(`
      ALTER TABLE "favorites" ADD COLUMN IF NOT EXISTS "userId_varchar" character varying
    `);
    await queryRunner.query(`
      UPDATE "favorites" f
      SET "userId_varchar" = u."clerkId"
      FROM "users" u
      WHERE u."id" = f."userId"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP COLUMN IF EXISTS "userId"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" RENAME COLUMN "userId_varchar" TO "userId"
    `);

    // Restore indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_favorites_userId" ON "favorites" ("userId")`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_favorites_user_quote" ON "favorites" ("userId", "quoteId")`);

    // Drop users table
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}

