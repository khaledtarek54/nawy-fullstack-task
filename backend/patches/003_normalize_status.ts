import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeStatus1700000003000 implements MigrationInterface {
  name = 'NormalizeStatus1700000003000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE habitats
         SET status = LOWER(TRIM(status))
       WHERE status <> LOWER(TRIM(status));
    `);
  }

  async down(): Promise<void> {}
}
