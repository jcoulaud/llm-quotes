import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveApprovedStatus1757462400000 implements MigrationInterface {
  name = 'RemoveApprovedStatus1757462400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert any existing 'approved' quotes back to 'pending'
    await queryRunner.query(`
      UPDATE "quotes"
      SET "status" = 'pending'
      WHERE "status" = 'approved'
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_: QueryRunner): Promise<void> {
    // No safe automatic rollback for this semantic change
    // Intentionally left empty
  }
}
