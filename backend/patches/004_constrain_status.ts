import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConstrainStatus1700000004000 implements MigrationInterface {
  name = 'ConstrainStatus1700000004000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats
        ADD CONSTRAINT habitats_status_check
        CHECK (status IN ('available', 'pending', 'sold'));
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats
        DROP CONSTRAINT IF EXISTS habitats_status_check;
    `);
  }
}
